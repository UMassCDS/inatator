import "./styles/App.css";
import "@mantine/core/styles.css";
import { AppShell, Burger, Group, MantineProvider } from "@mantine/core";
// import Instruction from "./components/Instruction";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import Sidebar from "./components/Sidebar";

function App() {
  const [sideBarOpened, { toggle }] = useDisclosure();
  const [sideBarData, setSideBarData] = useState({});

  const handleSideBarChange = (data) => {
    setSideBarData(data);
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
            </Group>
          </AppShell.Header>
          <AppShell.Navbar p="md">
            <Sidebar onFormChange={handleSideBarChange} />
          </AppShell.Navbar>
          <AppShell.Main>Main</AppShell.Main>
        </AppShell>
      }
    </MantineProvider>
  );
}

export default App;
