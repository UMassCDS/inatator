/* eslint-disable react/prop-types */
import { Button, Group, Switch } from "@mantine/core";
import { useState } from "react";
import "../styles/Buttons.css";

function ButtonsPanel({
  onGeneratePrediction,
  onSaveAnnotation,
  onClearAnnotation,
  onLoadAnnotation,
  onSwitchChange,
}) {
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
  ];

  const [isPresence, setIsPresence] = useState(true);

  return (
    <Group>
      <Group>
        <Switch
          className={`custom-switch ${isPresence ? "presence" : "absence"}`}
          checked={isPresence}
          onChange={(event) => {
            setIsPresence(event.currentTarget.checked);
            onSwitchChange(event.currentTarget.checked);
          }}
          size="md"
          label={isPresence ? "presence" : "absence"}
        />
      </Group>
      {buttons.map((value) => (
        <Button
          key={value.id}
          id={value.id}
          onClick={value.onClick}
          variant="filled"
        >
          {value.text}
        </Button>
      ))}
    </Group>
  );
}

export default ButtonsPanel;
