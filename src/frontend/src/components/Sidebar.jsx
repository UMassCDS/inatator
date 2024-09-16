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
} from "@mantine/core";
import { useEffect, useState } from "react";

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

function Sidebar({ onFormChange }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [taxaValue, setTaxaValue] = useState(null);
  const [search, setSearch] = useState("");

  const [taxaNames, setTaxaNames] = useState([]);
  const [taxaInfo, setTaxaInfo] = useState(null);

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
    // Fetch taxa json metadata
    fetch("/static/taxa_names.json")
      .then((response) => response.json())
      .then((data) => {
        setTaxaNames(data); //data.map((name) => ({ value: name, label: name }))
        console.log("Loaded taxa_names.json");
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

  // inat api fetch function
  useEffect(() => {
    if (!taxaValue) {
      setTaxaInfo(null);
      return;
    }

    try {
      const split = taxaValue.split("(")[1]; // extract taxa id
      const taxaid = split ? split.slice(0, split.length - 1) : null;

      if (taxaid) {
        fetch(`https://api.inaturalist.org/v1/taxa/${taxaid}`)
          .then((response) => response.json())
          .then((data) => {
            setTaxaInfo(data.results[0]);
          })
          .catch((error) => console.error("Error fetching taxa info:", error));
      }
    } catch (error) {
      console.error("Error in fetching taxa info:", error);
      setTaxaInfo(null);
    }
  }, [taxaValue]);

  // form changes are reflected on state
  useEffect(() => {
    onFormChange(form.values);
  }, [form.values, onFormChange]);

  return (
    <>
      {/* Combobox has autocomplete style and forces user to select a valid option */}
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(val) => {
          setTaxaValue(val);
          form.setFieldValue("taxa", val);
          setSearch(val);
          combobox.closeDropdown();
          console.log(form.values);
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
