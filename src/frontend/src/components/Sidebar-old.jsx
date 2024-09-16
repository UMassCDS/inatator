import React, { forwardRef, useEffect, useState } from "react";
import {
  TextInput,
  NumberInput,
  Checkbox,
  Select,
  Text,
  Image,
  Stack,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { debounce } from "@mantine/hooks";

const SHOW_DISABLE_OCEAN_MASK_CHECKBOX = false;
const DEFAULT_SPECIES_DATA = { name: "", common_name: "" };
const DEFAULT_IMG_URL = "/static/inat_logo_square.png";

const Sidebar = forwardRef((props, ref) => {
  const [taxaNames, setTaxaNames] = useState([]);
  const [speciesData, setSpeciesData] = useState(DEFAULT_SPECIES_DATA);
  const [imgURL, setImgURL] = useState(DEFAULT_IMG_URL);

  const form = useForm({
    initialValues: {
      taxa_name: "",
      model: "AN_FULL_max_1000",
      threshold: 0.1,
      hexResolution: 4,
      disable_ocean_mask: false,
    },
  });

  useEffect(() => {
    fetch("/static/taxa_names.json")
      .then((response) => response.json())
      .then((data) => {
        setTaxaNames(data.map((name) => ({ value: name, label: name })));
      })
      .catch((error) => console.error("Error loading taxa names:", error));
  }, []);

  const debouncedFetch = debounce((input) => {
    fetch(`https://api.inaturalist.org/v1/taxa/${input}`)
      .then((response) => response.json())
      .then((data) => {
        setSpeciesData({
          name: data.results[0].name,
          common_name:
            data.results[0].preferred_common_name || "No preferred common name",
        });
        setImgURL(
          data.results[0].default_photo.medium_url ||
            data.results[0].default_photo.url
        );
      })
      .catch((error) => console.error("Error fetching taxa info:", error));
  }, 500);

  useEffect(() => {
    if (form.values.taxa_name) {
      const regExp = /\(([^)]+)\)/;
      const taxaMatch = form.values.taxa_name.match(regExp);
      if (taxaMatch) {
        debouncedFetch(taxaMatch[1]);
      }
    }
  }, [form.values.taxa_name]);

  return (
    <Stack spacing="md">
      <Select
        label="Taxa Name"
        placeholder="Select taxa name"
        data={taxaNames}
        searchable
        nothingFound="No options"
        maxDropdownHeight={280}
        {...form.getInputProps("taxa_name")}
        ref={ref.taxaName}
      />

      <TextInput
        label="Model"
        {...form.getInputProps("model")}
        readOnly
        ref={ref.model}
      />

      <NumberInput
        label="Threshold"
        min={0.01}
        max={0.99}
        step={0.01}
        {...form.getInputProps("threshold")}
        ref={ref.threshold}
      />

      <NumberInput
        label="Hex Resolution"
        min={1}
        max={10}
        {...form.getInputProps("hexResolution")}
        readOnly
        ref={ref.hexResolution}
      />

      {SHOW_DISABLE_OCEAN_MASK_CHECKBOX && (
        <Checkbox
          label="Disable Ocean Mask"
          {...form.getInputProps("disable_ocean_mask", { type: "checkbox" })}
          ref={ref.disableOceanMask}
        />
      )}

      <Box>
        <Image
          src={imgURL}
          alt="species_default_image"
          width={200}
          height={200}
          fit="contain"
        />
        {speciesData.name && (
          <Text>
            <Text span fw={700}>
              Name:
            </Text>{" "}
            {speciesData.name}
          </Text>
        )}
        {speciesData.common_name && (
          <Text>
            <Text span fw={700}>
              Common Name:
            </Text>{" "}
            {speciesData.common_name}
          </Text>
        )}
      </Box>
    </Stack>
  );
});
