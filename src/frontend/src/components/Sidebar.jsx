/* eslint-disable react/prop-types */
import { useForm } from "@mantine/form";
import {
  TypographyStylesProvider,
  Select,
  NumberInput,
  Text,
  Image,
  useCombobox,
  Combobox,
  InputBase,
  LoadingOverlay,
  Tooltip,
  Stack,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { ActionIcon } from "@mantine/core";
import { parseTaxaID } from "../util";
import { IconPlayerTrackNext } from "@tabler/icons-react";

const MAX_OPTION_SIZE = 7; // Number of suggestions in autocomplete box

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
    handlers.open();
    if (!taxaValue) {
      setTaxaInfo(null);
      return;
    }

    try {
      const taxaid = parseTaxaID(taxaValue);

      if (taxaid) {
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
      handlers.close();
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
  const [imgLoading, imgLoadingHandlers] = useDisclosure(false);
  const { taxaInfo, fetchTaxaInfo } = useTaxaInfo(handlers);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const cycleImage = () => {
    if (taxaInfo && taxaInfo.taxon_photos) {
      imgLoadingHandlers.open();
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % taxaInfo.taxon_photos.length
      );
    }
  };

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
  }, [form.values]);

  return (
    <Stack gap="md">
      {/* combobox has autocomplete style and forces user to select a valid option */}
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(val) => {
          setCurrentImageIndex(0);
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
        <div
          style={{
            marginTop: "5%",
            padding: "10px",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <LoadingOverlay
            visible={visible}
            overlayProps={{ radius: "sm", blur: 2 }}
          />

          <div
            style={{
              position: "relative",
              width: "100%",
              height: "auto",
            }}
          >
            <LoadingOverlay
              visible={imgLoading}
              overlayProps={{ radius: "sm", blur: 2 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: "10px",
              }}
            />
            <Image
              src={
                taxaInfo.taxon_photos[currentImageIndex]?.photo.original_url ||
                taxaInfo.default_photo.medium_url ||
                taxaInfo.default_photo.url
              }
              alt={taxaInfo.name}
              width={200}
              height={200}
              fit="contain"
              style={{ borderRadius: "10px", marginBottom: "15px" }}
              onLoad={() => imgLoadingHandlers.close()}
            />
          </div>

          <Tooltip label="Cycle to next image">
            <ActionIcon
              onClick={cycleImage}
              style={{ marginTop: "10px", marginBottom: "10px" }}
              disabled={
                !taxaInfo.taxon_photos || taxaInfo.taxon_photos.length <= 1
              }
              color="blue"
              variant="default"
            >
              <IconPlayerTrackNext />
            </ActionIcon>
          </Tooltip>

          <Text fw={700} size="lg" mt="md">
            Common Name: {taxaInfo.preferred_common_name || "No common name"}
          </Text>
          <Text size="sm" mb="md">
            Scientific Name: {taxaInfo.name}
          </Text>

          {taxaInfo.wikipedia_url && (
            <Text>
              <a
                href={taxaInfo.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#4eaee4", fontWeight: 500 }}
              >
                Wikipedia Page
              </a>
            </Text>
          )}

          {taxaInfo.observations_count && (
            <Text mt="xs">
              Number of observations: {taxaInfo.observations_count}
            </Text>
          )}

          {taxaInfo.wikipedia_summary && (
            <TypographyStylesProvider mt="lg" style={{ textAlign: "left" }}>
              <div
                dangerouslySetInnerHTML={{ __html: taxaInfo.wikipedia_summary }}
              />
            </TypographyStylesProvider>
          )}
        </div>
      )}
    </Stack>
  );
}

export default Sidebar;
