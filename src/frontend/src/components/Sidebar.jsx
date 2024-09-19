/* eslint-disable react/prop-types */
import { useForm } from "@mantine/form";
import {
  Select,
  NumberInput,
  Text,
  Image,
  useCombobox,
  Combobox,
  InputBase,
  LoadingOverlay,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { parseTaxaID } from "../util";

const MAX_OPTION_SIZE = 7;

function getFilteredOptions(data, searchQuery, limit) {
  const result = [];

  for (let i = 0; i < data.length; i += 1) {
    if (result.length === limit) {
      break;
    }

    if (data[i].toLowerCase().includes(searchQuery.trim().toLowerCase())) {
      result.push(data[i]);
    }
  }

  return result;
}

// function that handles inat api calls and loading status
const useTaxaInfo = (handlers) => {
  const [taxaInfo, setTaxaInfo] = useState(null);

  const fetchTaxaInfo = async (taxaValue) => {
    if (!taxaValue) {
      setTaxaInfo(null);
      return;
    }

    try {
      const taxaid = parseTaxaID(taxaValue);

      if (taxaid) {
        handlers.open();
        try {
          const response = await fetch(
            `https://api.inaturalist.org/v1/taxa/${taxaid}`
          );
          const data = await response.json();
          setTaxaInfo(data.results[0]);
        } catch (error) {
          console.error("Error fetching taxa info:", error);
          setTaxaInfo(null);
        } finally {
          handlers.close();
        }
      }
    } catch (error) {
      console.error("Error in parsing taxa value:", error);
      setTaxaInfo(null);
    }
  };

  return { taxaInfo, fetchTaxaInfo };
};

function Sidebar({ onFormChange }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [taxaValue, setTaxaValue] = useState(null);
  const [search, setSearch] = useState("");

  const [taxaNames, setTaxaNames] = useState([]);

  const [visible, handlers] = useDisclosure(false);
  const { taxaInfo, fetchTaxaInfo } = useTaxaInfo(handlers);

  // Set initial form values, geomodel may need to be tweaked
  const form = useForm({
    initialValues: {
      taxa: "",
      geomodel: "AN_FULL_max_1000",
      threshold: 0.1,
      hexResolution: 4,
    },
  });

  useEffect(() => {
    console.log("Loaded taxa_names.json");
    // Fetch taxa json metadata
    fetch("/static/taxa_names.json")
      .then((response) => response.json())
      .then((data) => {
        setTaxaNames(data);
      });
  }, []);

  // Gets X amount of matches to search query
  const filteredOptions = getFilteredOptions(
    taxaNames,
    search,
    MAX_OPTION_SIZE
  );
  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  // form changes are reflected on state
  useEffect(() => {
    onFormChange(form.values);
  }, [form.values, onFormChange]);

  return (
    <>
      {/* combobox has autocomplete style and forces user to select a valid option */}
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(val) => {
          setTaxaValue(val);
          form.setFieldValue("taxa", val);
          setSearch(val);
          combobox.closeDropdown();
          fetchTaxaInfo(val);
        }}
      >
        <Combobox.Target>
          <InputBase
            rightSection={<Combobox.Chevron />}
            value={search}
            onChange={(event) => {
              combobox.openDropdown();
              combobox.updateSelectedOptionIndex();
              setSearch(event.currentTarget.value);
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => {
              combobox.closeDropdown();
              setSearch(taxaValue || "");
            }}
            placeholder="Search value"
            rightSectionPointerEvents="none"
          />
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>
            {options.length > 0 ? (
              options
            ) : (
              <Combobox.Empty>Nothing found</Combobox.Empty>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      {/* Input segment for geomodels */}
      <Select
        label="GeoModel"
        placeholder="Select a GeoModel"
        data={["AN_FULL_max_1000"]}
        variant="filled"
        readOnly
        {...form.getInputProps("geomodel")}
      />
      {/* Threshold input */}
      <NumberInput
        label="Threshold"
        placeholder="Enter a threshold between [0.01, 1.0]"
        error="Enter a valid probability [0.01, 1.0]"
        step={0.01}
        min={0.01}
        max={1.0}
        {...form.getInputProps("threshold")}
      />
      {/* Hexagon read-only input */}
      <NumberInput
        label="Hexagon Resolution"
        placeholder="Enter hexagon resolution between [1, 15]"
        error="Please enter in valid range [1, 15]"
        min={1}
        max={15}
        variant="filled"
        readOnly
        {...form.getInputProps("hexResolution")}
      />
      {taxaInfo && (
        <div style={{ marginTop: "5%" }}>
          <LoadingOverlay
            visible={visible}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          <Image
            src={
              taxaInfo.default_photo.medium_url || taxaInfo.default_photo.url
            }
            alt={taxaInfo.name}
            width={200}
            height={200}
            fit="contain"
          />
          <Text fw={700}>
            Common Name: {taxaInfo.preferred_common_name || "No common name"}
          </Text>
          <Text fs>Scientific Name: {taxaInfo.name}</Text>
        </div>
      )}
    </>
  );
}

export default Sidebar;
