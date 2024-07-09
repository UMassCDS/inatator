import React, { forwardRef, useEffect, useState } from "react";
import $ from "jquery";
import "jquery-ui-dist/jquery-ui.css";
import "jquery-ui-dist/jquery-ui.js";

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const Sidebar = forwardRef((props, ref) => {
  const [, setTaxaNames] = useState([]);
  const [description, setDescription] = useState("");
  const [taxaName, setTaxaName] = useState("");
  const [imgURL, setImgURL] = useState("/static/inat_logo_square.png");

  useEffect(() => {
    // Fetch taxa names from the JSON file and initialize auto-suggest
    fetch("/static/taxa_names.json")
      .then((response) => response.json())
      .then((data) => {
        setTaxaNames(data);
        // Initialize jQuery UI autocomplete
        $("#taxa_name").autocomplete({
          source: data,
          minLength: 2,
          change: function (event, ui) {
            // Check if the value is in the list
            if (ui.item == null) {
              // If not, clear the input field
              $(this).val("");
              alert("Please select a valid taxa name from the list.");
            }
          },
          select: function (event, ui) {
            setTaxaName(ui.item.value);
          },
        });
      })
      .catch((error) => console.error("Error loading taxa names:", error));
  }, []);

  const debouncedFetch = debounce((input) => {
    fetch(`https://api.inaturalist.org/v1/taxa/${input}`)
      .then((response) => response.json())
      .then((data) => {
        setDescription(
          `${data.results[0].name}: ${
            data.results[0].preferred_common_name
              ? data.results[0].preferred_common_name
              : "No preferred common name"
          }`
        );
        setImgURL(data.results[0].default_photo.url);
      })
      .catch((error) => console.error("Error fetching taxa info:", error));
  }, 500);

  useEffect(() => {
    if (taxaName) {
      const regExp = /\(([^)]+)\)/;
      const taxaMatch = taxaName.match(regExp);
      if (taxaMatch) {
        debouncedFetch(taxaMatch[1]);
      }
    }
  }, [taxaName, debouncedFetch]);

  return (
    <div className="sidebar">
      <label htmlFor="taxa_name">Taxa Name:</label>
      <input
        type="text"
        id="taxa_name"
        defaultValue="" //Ranunculus alpestris (130712)
        ref={ref.taxaName}
        onInput={(e) => setTaxaName(e.target.value)}
      />

      <label htmlFor="model">Model:</label>
      <select
        name="Model"
        id="model"
        defaultValue="AN_FULL_max_1000"
        ref={ref.model}
      >
        <option value="AN_FULL_max_10">AN_FULL max 10</option>
        <option value="AN_FULL_max_100">AN_FULL max 100</option>
        <option value="AN_FULL_max_1000">AN_FULL max 1000</option>
        <option value="Distilled_env_model">Distilled env model</option>
      </select>

      <label htmlFor="threshold">Threshold:</label>
      <input
        type="number"
        step="0.01"
        id="threshold"
        defaultValue="0.1"
        min="0.1"
        max="0.9"
        ref={ref.threshold}
      />

      <label htmlFor="hexResolution">Hex Resolution:</label>
      <input
        type="number"
        id="hexResolution"
        defaultValue="5"
        min="1"
        max="10"
        ref={ref.hexResolution}
      />

      <div className="checkbox-container">
        <input
          type="checkbox"
          id="disable_ocean_mask"
          name="Disable Ocean Mask"
          ref={ref.disableOceanMask}
        />
        <label htmlFor="disable_ocean_mask"> Disable Ocean Mask</label>
      </div>

      <div className="taxa-info">
        <img src={imgURL} alt="species_default_image" />
        <p>{description}</p>
      </div>
    </div>
  );
});

export default Sidebar;
