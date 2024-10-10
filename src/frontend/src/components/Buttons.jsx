/* eslint-disable react/prop-types */
import { Button, Group, Switch, Flex } from "@mantine/core";
import { useState } from "react";
import "../styles/Buttons.css";

function ButtonsPanel({
  onGeneratePrediction,
  onSaveAnnotation,
  onClearAnnotation,
  onLoadAnnotation,
  onSwitchChange,
  onDownloadAnnotation,
  isValidTaxa,
}) {
  // Buttons component, gets passed in logic handlers that manage state of the app
  const buttons = [
    {
      id: "generate_prediction",
      text: "Generate Prediction",
      onClick: onGeneratePrediction,
    },
    {
      id: "save_annotation",
      text: "Save Annotation",
      onClick: onSaveAnnotation,
    },
    {
      id: "load_annotation",
      text: "Load Annotation",
      onClick: onLoadAnnotation,
    },
    {
      id: "clear_annotation",
      text: "Clear Annotation",
      onClick: onClearAnnotation,
    },
    {
      id: "download_annotation",
      text: "Download Annotation",
      onClick: onDownloadAnnotation,
    },
  ];

  const [isPresence, setIsPresence] = useState(true); // state variable for the switch component

  return (
    <Group style={{ padding: "1%", width: "100%", flex: "0 0 auto" }}>
      <Flex
        gap="xs"
        direction="row"
        justify="space-between"
        align="center"
        style={{ width: "100%" }}
      >
        <Switch
          disabled={!isValidTaxa}
          className={`custom-switch ${isPresence ? "presence" : "absence"}`}
          checked={isPresence}
          onChange={(event) => {
            setIsPresence(event.currentTarget.checked);
            onSwitchChange(event.currentTarget.checked);
          }}
          style={{ height: "2em" }}
          size="md"
          label={isPresence ? "presence" : "absence"}
        />
        {buttons.map((value) => (
          <Button
            disabled={!isValidTaxa}
            key={value.id}
            id={value.id}
            onClick={value.onClick}
            variant="filled"
          >
            {value.text}
          </Button>
        ))}
      </Flex>
    </Group>
  );
}

export default ButtonsPanel;
