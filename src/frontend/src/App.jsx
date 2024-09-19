import "./styles/App.css";
import "@mantine/core/styles.css";
import { AppShell, Burger, Group, MantineProvider, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ButtonsPanel from "./components/Buttons";
import Instruction from "./components/Instruction";
import {
  parseTaxaID,
  handleAddAnnotationHexagonIDs,
  handleAddAnnotationMultiSelect,
  handleClearAnnotation,
  handleGeneratePrediction,
  handleLoadAnnotation,
  handleSaveAnnotation,
} from "./util";

const OCEAN_MASK = false;

function App() {
  const [sideBarOpened, { toggle }] = useDisclosure();
  const [sideBarData, setSideBarData] = useState({});
  const [isPresence, setIsPresence] = useState(true);
  const [predictionHexagonIDs, setPredictionHexagonIDs] = useState([]);
  const [annotationHexagonIDs, setAnnotationHexagonIDs] = useState({
    presence: [],
    absence: [],
  });

  const handler = {
    setPredictionHexagonIDs: (data) => setPredictionHexagonIDs(data),
    setAnnotationHexagonIDs: (data) => setAnnotationHexagonIDs(data),
  };

  const handleSideBarChange = (data) => {
    setSideBarData(data);
    console.log(data);
  };

  const handleSwitchChange = (data) => {
    setIsPresence(data);
    console.log(data);
  };

  return (
    <MantineProvider>
      {
        <AppShell
          header={{ height: { base: 60, md: 70, lg: 80 } }}
          navbar={{
            width: { base: 200, md: 300, lg: 400 },
            breakpoint: "sm",
            collapsed: { mobile: !sideBarOpened },
          }}
          padding="md"
        >
          <AppShell.Header>
            <Group justify="space-between" h="100%" px="md">
              <Group h="100%" px="md">
                <Burger
                  opened={sideBarOpened}
                  onClick={toggle}
                  hiddenFrom="sm"
                  size="sm"
                />
                <img
                  src="/static/favicon.ico"
                  alt="Logo"
                  style={{ height: "30px" }}
                />
                <Text size="lg" fw={700}>
                  iNatator
                </Text>
              </Group>
              <Instruction />
            </Group>
          </AppShell.Header>
          <AppShell.Navbar p="md">
            <Sidebar onFormChange={handleSideBarChange} />
          </AppShell.Navbar>
          <AppShell.Main>
            <ButtonsPanel
              onSwitchChange={handleSwitchChange}
              onGeneratePrediction={() => {
                const payloadData = {
                  taxa_name: sideBarData.taxa,
                  hex_resolution: sideBarData.hexResolution,
                  threshold: sideBarData.threshold,
                  model: sideBarData.geomodel,
                  disable_ocean_mask: OCEAN_MASK,
                };

                handleGeneratePrediction(payloadData, handler);
              }}
              onSaveAnnotation={() => {
                const payloadData = {
                  taxa_name: sideBarData.taxa,
                  hex_resolution: sideBarData.hexResolution,
                  threshold: sideBarData.threshold,
                  model: sideBarData.geomodel,
                  disable_ocean_mask: OCEAN_MASK,
                  annotation_hexagon_ids: annotationHexagonIDs,
                };

                handleSaveAnnotation(payloadData, handler);
              }}
              onLoadAnnotation={() => {
                const payloadData = {
                  taxa_name: sideBarData.taxa,
                  hex_resolution: sideBarData.hexResolution,
                  threshold: sideBarData.threshold,
                  model: sideBarData.geomodel,
                  disable_ocean_mask: OCEAN_MASK,
                };

                handleLoadAnnotation(payloadData, handler);
              }}
              onClearAnnotation={() => handleClearAnnotation(null, handler)}
            />
          </AppShell.Main>
        </AppShell>
      }
    </MantineProvider>
  );
}

export default App;
