import { useDisclosure } from "@mantine/hooks";
import { Drawer, ActionIcon, Tooltip } from "@mantine/core";
import { IconHelp } from "@tabler/icons-react";
import "../styles/Instruction.css";

function Instruction() {
  // Instructions component, served as a drawer
  const [opened, { open, close }] = useDisclosure(false); // Opens or closes the drawer when its clicked

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        position="left"
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.5, blur: 0.4 }}
        size="33%"
      >
        {
          <div className="instructions">
            <h3>Instructions</h3>
            <p>
              1. To start the annotation, please select a <b>Taxa Name</b> in
              the left menu.
            </p>
            <p>
              2. You can enter the <b>Taxa Name</b> or its <b>ID</b> from the{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.inaturalist.org/observations?place_id=any&view=species"
              >
                iNaturalist’s
              </a>{" "}
              website.
            </p>
            <p>
              3. After selecting the <b>Taxa Name</b>, use one of the{" "}
              <b>buttons</b> to manage the annotation.
            </p>

            <p>
              <b>Note:</b> You can only annotate the center map. If you zoom
              out, you will see multiple maps, because of the way the map
              provider works. You cannot annotate the maps other than the one in
              the center.
            </p>

            <h4>Buttons Function:</h4>
            <ol>
              <li>
                <strong className="generate-prediction">
                  Generate Prediction
                </strong>
                : Clicking this button sends a request to the model, which
                returns predictions.
                <p>
                  These predictions can be viewed in several formats (selected
                  in the <u>upper right corner of the map</u>):
                </p>
                <ul>
                  <li>
                    <strong>Annotation (Presence)</strong>: Displays loaded
                    predictions in <b style={{ color: "#00b175" }}>green</b>.{" "}
                    <b>
                      This is the <u>starting</u> point for <b>presence</b>{" "}
                      species annotations.
                    </b>
                  </li>
                  <li>
                    <strong>Annotation (Absence)</strong>: Empty by default, but
                    will be populated with{" "}
                    <b style={{ color: "#e14b23" }}>red</b> hexagons when adding{" "}
                    <b>absence</b> species annotations.
                  </li>

                  <li>
                    <strong>Prediction Hexagons</strong>: Predictions in the
                    form of hexagons (<b style={{ color: "#4eaee4" }}>blue</b>{" "}
                    color). <b>Not editable</b>.
                  </li>
                </ul>
                Additional layers:
                <ul>
                  <li>
                    <strong>Hexagon Grid</strong>: Helps to see the grid of
                    hexagons for more convenient marking of the annotation.
                  </li>
                  <li>
                    <strong>iNaturalist Observations</strong>: User observations
                    from the iNaturalist website. <b>Not editable</b>.
                  </li>
                </ul>
              </li>
              <br />
              <li>
                <strong className="save-annotation">Save Annotation</strong>:
                Clicking this button saves the current annotation layers to the
                database (both <b style={{ color: "#00b175" }}>presence</b> and{" "}
                <b style={{ color: "#e14b23" }}>absence</b> hexagons).
                <p>
                  Before clicking this button, make sure that the annotation
                  looks correct for the selected Taxa.
                </p>
              </li>
              <br />
              <li>
                <strong className="load-annotation">Load Annotation</strong>:
                Clicking this button loads the last saved annotation for the
                currently selected Taxa from the database.
                <p>
                  After loading, you can edit it and save it again. A new save
                  will <b>overwrite</b> the previous one.
                </p>
              </li>
              <br />
              <li>
                <strong className="clear-annotation">Clear Annotation</strong>:
                Clicking this button clears the current annotation from the
                screen, allowing you to start annotating from scratch.
                <p>
                  Once you complete your annotation, be sure to <b>save</b> it
                  using the <b>Save Annotation</b> button.
                </p>
              </li>
            </ol>

            <h4>Drawing Tool Functionality:</h4>
            <p>
              A selection/drawing tool allows you to draw either a rectangle or
              a polygon:
            </p>
            <ul>
              <li>
                A toggle lets you switch between hexagon types:{" "}
                <b style={{ color: "#00b175" }}>presence</b> or{" "}
                <b style={{ color: "#e14b23" }}>absence</b>.
              </li>
              <li>
                Draw a polygon to <b>ADD</b> multiple annotation hexagons to the
                map.
              </li>
              <li>
                Draw a rectangle to <b>REMOVE</b> multiple annotation hexagons
                from the map.
              </li>
            </ul>
          </div>
        }
      </Drawer>
      <Tooltip label="Open Instructions">
        <ActionIcon variant="default" size="md" onClick={open}>
          <IconHelp />
        </ActionIcon>
      </Tooltip>
    </>
  );
}

export default Instruction;
