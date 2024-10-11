import "@mantine/core/styles.css";
import {
  AppShell,
  Burger,
  Flex,
  Group,
  LoadingOverlay,
  MantineProvider,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ButtonsPanel from "./components/Buttons";
import Instruction from "./components/Instruction";
import Map from "./components/Map";
import {
  parseTaxaID,
  handleAddAnnotationHexagonIDs,
  handleAddAnnotationMultiSelect,
  handleClearAnnotation,
  handleGeneratePrediction,
  handleLoadAnnotation,
  handleSaveAnnotation,
  handleDownloadAnnotation,
} from "./util"; // handler functions to be passed into components

const OCEAN_MASK = false;
const HEX_RESOLUTION = 4;

function App() {
  // State variables to handle interactions and data
  const [sideBarOpened, { toggle }] = useDisclosure();
  const [sideBarData, setSideBarData] = useState({
    taxa: "",
    geomodel: "AN_FULL_max_1000",
    threshold: 0.1,
    hexResolution: 4,
  });
  const [isPresence, setIsPresence] = useState(true);
  const [predictionHexagonIDs, setPredictionHexagonIDs] = useState(null);
  const [annotationHexagonIDs, setAnnotationHexagonIDs] = useState({
    presence: [],
    absence: [],
  });
  const [isValidTaxa, setIsValidTaxa] = useState(false);
  const [isLoading, loadingHandlers] = useDisclosure(false);

  // handler is an object that wraps state functions
  // handler is passed into imported handler functions
  // handler manages app state
  const handler = {
    setPredictionHexagonIDs: (data) => setPredictionHexagonIDs(data),
    setAnnotationHexagonIDs: (data) => setAnnotationHexagonIDs(data),
    loadingHandlers: loadingHandlers,
  };

  // handler passed into sidebar component
  const handleSideBarChange = (data) => {
    setSideBarData(data);
    setAnnotationHexagonIDs({ presence: [], absence: [] });
    if (parseTaxaID(data.taxa)) {
      setIsValidTaxa(true);
    }
  };

  // handler passed into buttons component
  const handleSwitchChange = (data) => {
    setIsPresence(data);
  };

  // creates appshell(template for the application)
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
          <AppShell.Navbar
            p="md"
            style={{
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flexGrow: 1, overflow: "auto" }}>
              <Sidebar onFormChange={handleSideBarChange} />
            </div>
          </AppShell.Navbar>
          <AppShell.Main>
            <Flex direction="column" style={{ position: "relative" }}>
              <ButtonsPanel // Buttons component
                isValidTaxa={isValidTaxa}
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
                onDownloadAnnotation={() => {
                  const payloadData = {
                    taxa_name: sideBarData.taxa,
                    hex_resolution: sideBarData.hexResolution,
                    annotation_hexagon_ids: annotationHexagonIDs,
                  };

                  handleDownloadAnnotation(payloadData, handler);
                }}
              />
              <LoadingOverlay
                visible={isLoading}
                overlayProps={{ radius: "lg", blur: 0.2 }}
                style={{ zIndex: 1, position: "absolute" }}
              />
              <div style={{ zIndex: 0 }}>
                <Map
                  predictionHexagonIDs={predictionHexagonIDs}
                  annotationHexagonIDs={annotationHexagonIDs}
                  hexResolution={HEX_RESOLUTION}
                  taxonId={parseTaxaID(sideBarData.taxa)}
                  onAddAnnotationHexagonIDs={(hexagonID) =>
                    handleAddAnnotationHexagonIDs(
                      hexagonID,
                      handler,
                      isPresence
                    )
                  }
                  onAddAnnotationMultiSelect={(
                    hexagonIDs,
                    isAddAnnotationMultiSelect
                  ) =>
                    handleAddAnnotationMultiSelect(
                      hexagonIDs,
                      isAddAnnotationMultiSelect,
                      handler,
                      isPresence
                    )
                  }
                />
              </div>
            </Flex>
          </AppShell.Main>
        </AppShell>
      }
    </MantineProvider>
  );
}

export default App;
