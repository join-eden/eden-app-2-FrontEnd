import { faker } from "@faker-js/faker";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { OpenOrClosed, ProjectStatusCard } from "./ProjectStatusCard";

export default {
  title: "Cards/ProjectStatusCard",
  component: ProjectStatusCard,
  argTypes: {},
} as ComponentMeta<typeof ProjectStatusCard>;

const Template: ComponentStory<typeof ProjectStatusCard> = (args) => (
  <ProjectStatusCard {...args} />
);

export const Default = Template.bind({});
Default.args = {
  projectImg: faker.internet.avatar(),
  projectName: faker.company.name(),
  roleName: "BackEnd Developer",
  status: OpenOrClosed.OPEN,
  appliedDateData: {
    type: "primary",
    dayOfMonth: 22,
    month: "AUG",
    year: 22,
  },
  kickoffDateData: {
    type: "secondary",
    dayOfMonth: 22,
    month: "AUG",
    year: 22,
  },
  progressSteps: [
    {
      name: "Applied",
      completed: true,
    },
    {
      name: "Application Reviewed",
      completed: true,
    },
    {
      name: "Application Shortlisted",
      completed: false,
    },
    {
      name: "Application Shortlisted",
      completed: false,
    },
  ],
};