import React from "react";
import OSCALSystemImplementation from "../components/OSCALSystemImplementation";
import { exampleSystemImplementation } from "../test-data/SystemData";
import { exampleParties } from "../test-data/CommonData";

export default {
  title: "Components/System Implementation",
  component: OSCALSystemImplementation,
};

function Template(args) {
  return <OSCALSystemImplementation {...args} />;
}

export const Default = Template.bind({});

Default.args = {
  systemImplementation: exampleSystemImplementation,
  parties: exampleParties,
};
