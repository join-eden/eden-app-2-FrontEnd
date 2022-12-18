import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { FIND_PROJECT } from "@eden/package-graphql";
import {
  ApplyByRoleContainer,
  AppUserSubmenuLayout,
  Card,
  GridItemEight,
  GridItemTwo,
  GridLayout,
  Loading,
  SEOProject,
} from "@eden/package-ui";
import * as React from "react";

const ProfilePage = ({ project }: { project: Project }) => {
  //   console.log("project", project);
  return (
    <>
      <SEOProject
        project={project?.title || ""}
        image={""}
        role={"role here"}
      />
      <AppUserSubmenuLayout showSubmenu={false}>
        <GridLayout className={`bg-background h-screen`}>
          <GridItemTwo> </GridItemTwo>
          <GridItemEight>
            <Card
              shadow
              className={`h-85 scrollbar-hide overflow-y-scroll bg-white`}
            >
              {project ? (
                <ApplyByRoleContainer
                  project={project}
                  onViewProject={() => console.log("switch")}
                />
              ) : (
                <Loading title={`Searching...`} />
              )}
            </Card>
          </GridItemEight>
          <GridItemTwo> </GridItemTwo>
        </GridLayout>
      </AppUserSubmenuLayout>
    </>
  );
};

export default ProfilePage;

import { Project } from "@eden/package-graphql/generated";
import type { GetServerSideProps } from "next";

const client = new ApolloClient({
  ssrMode: typeof window === "undefined",
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL as string,
    credentials: "same-origin",
  }),
  cache: new InMemoryCache(),
});

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { _id } = context.query;

  const { data } = await client.query({
    query: FIND_PROJECT,
    variables: {
      fields: {
        _id,
      },
      ssr: true,
    },
  });

  return {
    props: {
      project: data.findProject,
    },
  };
};
