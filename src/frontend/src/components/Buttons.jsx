/* eslint-disable react/prop-types */
import { Button, Group, Switch } from "@mantine/core";

function ButtonsPanel({
  onGeneratePrediction,
  onSaveAnnotation,
  onClearAnnotation,
  onLoadAnnotation,
  isPresence,
  onToggle,
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

  return (
    <Group>
      <Switch checked={isPresence} onChange={onToggle}></Switch>
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
