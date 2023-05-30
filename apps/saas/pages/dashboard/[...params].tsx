import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_NEW_TALENT_LIST,
  FIND_POSITION_LIGHT,
  FIND_TALENT_LIST,
  MATCH_NODES_MEMBERS_AI4,
  UPDATE_TALENT_LIST_WITH_TALENT,
} from "@eden/package-graphql";
import { CandidateType, TalentListType } from "@eden/package-graphql/generated";
import {
  AppUserLayout,
  Button,
  CandidateInfo,
  CandidatesTableList,
  ListModeEnum,
  SelectList,
  TextField,
  TrainQuestionsEdenAI,
} from "@eden/package-ui";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { HiOutlineLink } from "react-icons/hi";
import { MdIosShare } from "react-icons/md";
import { toast } from "react-toastify";

import { NextPageWithLayout } from "../_app";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type Question = {
  _id: string;
  content: string;
  bestAnswer: string;
};

interface CandidateTypeSkillMatch extends CandidateType {
  skillMatch: number;
}

type NodeDisplay = {
  nameRelevantNode: string;
  nameOriginalNode: string;
  score: number;
  color: string;
};

type relevantNodeObj = {
  [key: string]: {
    nodes: NodeDisplay[];
  };
};

const PositionCRM: NextPageWithLayout = () => {
  const router = useRouter();
  const { params } = router.query;
  const [positionID, setPositionID] = useState<string>("");
  const [talentListID, setTalentListID] = useState<string>("");

  useEffect(() => {
    if (params) {
      setPositionID(params[0] as string);
      if (params[1]) setTalentListID(params[1] as string);
    }
  }, [params]);

  const [candidates, setCandidates] = useState<CandidateTypeSkillMatch[]>([]);

  const [nodeIDsPosition, setNodeIDsPosition] = useState<string[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserScore, setSelectedUserScore] = useState<number | null>(
    null
  );
  const [selectedUserSummaryQuestions, setSelectedUserSummaryQuestions] =
    useState<any[]>([]);

  const [questions, setQuestions] = useState<Question[]>([]);

  const [trainModalOpen, setTrainModalOpen] = useState(false);

  const [talentListsAvailables, setTalentListsAvailables] = useState<
    TalentListType[]
  >([]);

  const [talentListSelected, setTalentListSelected] =
    useState<TalentListType>();

  const [candidatesFromTalentList, setCandidatesFromTalentList] = useState<
    CandidateTypeSkillMatch[]
  >([]);

  const [newTalentListCreationMode, setNewTalentListCreationMode] =
    useState<boolean>(false);

  const [editTalentListMode, setEditTalentListMode] = useState<boolean>(false);

  const [newTalentListCandidatesIds, setNewTalentListCandidatesIds] = useState<
    string[]
  >([]);

  const [newTalentListName, setNewTalentListName] = useState<string>("");

  const [talentListToShow, setTalentListToShow] = useState<TalentListType>();

  const {
    data: findPositionData,
    loading: findPositionIsLoading,
    // error: findPositionError,
  } = useQuery(FIND_POSITION_LIGHT, {
    variables: {
      fields: {
        _id: positionID,
      },
    },
    skip: !Boolean(positionID),
    ssr: false,
    onCompleted: (data: any) => {
      const talentListsNames: TalentListType[] =
        data.findPosition.talentList.map((list: TalentListType) => list);

      setTalentListsAvailables(talentListsNames);

      setCandidates(data.findPosition.candidates);

      setCandidatesFromTalentList(data.findPosition.candidates);

      const questionPrep: Question[] = [];

      data.findPosition.questionsToAsk.map((question: any) => {
        if (question.question == null) {
        } else {
          questionPrep.push({
            _id: question.question._id,
            content: question.question.content,
            bestAnswer: question.bestAnswer,
          });
        }
      });

      const nodesID = data.findPosition?.nodes?.map((node: any) => {
        return node?.nodeData?._id;
      });

      setNodeIDsPosition(nodesID);

      setQuestions(questionPrep);
    },
  });

  const {} = useQuery(FIND_TALENT_LIST, {
    variables: {
      fields: {
        _id: talentListID,
      },
    },
    skip: !Boolean(talentListID),
    ssr: false,
    onCompleted: (data: any) => {
      // setTalentListsAvailables(data.findUserTalentListPosition);
      setTalentListToShow(data.findUserTalentListPosition);
    },
  });

  useEffect(() => {
    if (talentListID && talentListToShow && talentListsAvailables.length) {
      console.log("kakak");
      setTalentListSelected(talentListToShow);
      // setNewTalentListName(talentListToShow?.name!);
    }
  }, [talentListID, talentListToShow, talentListsAvailables]);

  const handleRowClick = (user: CandidateType) => {
    if (user.user?._id) setSelectedUserId(user.user?._id);
    if (user.overallScore) setSelectedUserScore(user.overallScore);
    if (user.summaryQuestions)
      setSelectedUserSummaryQuestions(user.summaryQuestions);
  };

  const [mostRelevantMemberNode, setMostRelevantMemberNode] =
    useState<relevantNodeObj>({});

  // console.log("nodeIDsPosition,candidates = ", nodeIDsPosition, candidates);

  const {} = useQuery(MATCH_NODES_MEMBERS_AI4, {
    variables: {
      fields: {
        nodesID: nodeIDsPosition,
        membersIDallow: candidatesFromTalentList?.map((userData: any) => {
          return userData?.user?._id;
        }),
        weightModules: [
          { type: "node_Skill", weight: 70 },
          { type: "node_Category", weight: 20 },
          { type: "node_Group", weight: 5 },
          { type: "node_total", weight: 50 },
          { type: "budget_total", weight: 80 },
          { type: "availability_total", weight: 85 },
          { type: "experience_total", weight: 85 },
          { type: "everythingElse_total", weight: 50 },
        ],
      },
    },
    skip: candidatesFromTalentList.length == 0 || nodeIDsPosition.length == 0,

    onCompleted: (data) => {
      // from data.matchNodesToMembers_AI4 change it to an object with member._id as the key

      // console.log(
      //   "data.matchNodesToMembers_AI4 = ",
      //   data.matchNodesToMembers_AI4
      // );
      // -------------- Get the Candidates of the page ------------
      const memberScoreObj: { [key: string]: number } = {};

      data.matchNodesToMembers_AI4.forEach((memberT: any) => {
        const keyN = memberT?.member?._id;

        if (memberScoreObj[keyN] == undefined) {
          memberScoreObj[keyN] = memberT?.matchPercentage?.totalPercentage;
        }
      });

      const candidatesNew: CandidateTypeSkillMatch[] = [];

      for (let i = 0; i < candidatesFromTalentList.length; i++) {
        const userID = candidatesFromTalentList[i]?.user?._id;

        if (userID && memberScoreObj[userID]) {
          candidatesNew.push({
            ...candidatesFromTalentList[i],
            skillMatch: memberScoreObj[userID],
          });
        } else {
          candidatesNew.push({
            ...candidatesFromTalentList[i],
          });
        }
      }
      setCandidatesFromTalentList(candidatesNew);
      // -------------- Get the Candidates of the page ------------

      // --------------- Find the related nodes Score and color -----------

      const mostRelevantMemberNodeT: relevantNodeObj = {};

      for (let i = 0; i < data?.matchNodesToMembers_AI4?.length; i++) {
        const infoN = data.matchNodesToMembers_AI4[i];

        const userID: string = infoN?.member?._id;

        if (userID && !mostRelevantMemberNodeT[userID]) {
          mostRelevantMemberNodeT[userID] = {
            nodes: [],
          };
        }

        const nodesPercentageT = infoN?.nodesPercentage;

        const nodesNew: NodeDisplay[] = [];

        interface RelevantMemberObj {
          [key: string]: boolean;
        }
        const mostRelevantMemberObj: RelevantMemberObj = {};

        const mostRelevantMemberNodes = [];

        for (let j = 0; j < nodesPercentageT?.length; j++) {
          const node = nodesPercentageT[j];

          // Take only the first mostRelevantMemberNodes, which has the heighers probability, later I can be more creative
          let mostRelevantMemberNode = null;

          if (
            node?.mostRelevantMemberNodes != undefined &&
            node?.mostRelevantMemberNodes?.length > 0
          ) {
            let i = 0;
            let relNode;

            while (
              mostRelevantMemberNode == null &&
              i < node?.mostRelevantMemberNodes.length
            ) {
              relNode = node?.mostRelevantMemberNodes[i];

              if (
                relNode?.node?._id != undefined &&
                !mostRelevantMemberObj[relNode?.node?._id]
              ) {
                mostRelevantMemberNode = relNode;
                mostRelevantMemberObj[relNode?.node?._id] = true;
              } else {
                i++;
              }
            }

            if (mostRelevantMemberNode == null) continue;
          }

          let colorT = "bg-purple-100";

          if (
            mostRelevantMemberNode?.score != null &&
            mostRelevantMemberNode?.score != undefined
          ) {
            if (mostRelevantMemberNode?.score > 60) {
              colorT = "bg-purple-500";
            } else if (mostRelevantMemberNode?.score > 30) {
              colorT = "bg-purple-400";
            } else if (mostRelevantMemberNode?.score > 13) {
              colorT = "bg-purple-300";
            } else if (mostRelevantMemberNode?.score > 5) {
              colorT = "bg-purple-200";
            }
          }

          mostRelevantMemberNodes.push({
            searchNode: node?.node,
            MemberRelevantnode: mostRelevantMemberNode?.node,
            score: mostRelevantMemberNode?.score,
            color: colorT,
          });

          nodesNew.push({
            nameOriginalNode: nodesPercentageT[j]?.node?.name,
            nameRelevantNode: mostRelevantMemberNode?.node?.name,
            score: mostRelevantMemberNode?.score,
            color: colorT,
          });
        }

        nodesNew.sort((a, b) => b.score - a.score); // sort based on score

        mostRelevantMemberNodeT[userID].nodes = nodesNew;
      }

      setMostRelevantMemberNode(mostRelevantMemberNodeT);

      // --------------- Find the related nodes Score and color -----------
    },
  });

  const [createTalentListPosition] = useMutation(CREATE_NEW_TALENT_LIST);

  const [updateUsersTalentListPosition] = useMutation(
    UPDATE_TALENT_LIST_WITH_TALENT,
    {
      onCompleted: (data) => {
        if (!editTalentListMode) {
          const lastTalentListIndex =
            data?.updateUsersTalentListPosition.talentList.length - 1;

          const newList =
            data?.updateUsersTalentListPosition.talentList[lastTalentListIndex];

          setTalentListToShow(newList);
          setNewTalentListCreationMode(false);
          setNewTalentListCandidatesIds([]);
          setNewTalentListName("");
        } else if (editTalentListMode) {
          const editedTalentListIndex =
            data?.updateUsersTalentListPosition.talentList.findIndex(
              (talentList: TalentListType) =>
                talentList._id === talentListSelected?._id
            );

          const editedTalentList =
            data?.updateUsersTalentListPosition.talentList[
              editedTalentListIndex
            ];

          setTalentListSelected(editedTalentList);

          const candidatesOnTalentListSelected: CandidateTypeSkillMatch[] = [];

          for (let i = 0; i < candidates.length; i++) {
            for (let j = 0; j < editedTalentList?.talent?.length!; j++) {
              if (
                candidates[i].user?._id ===
                editedTalentList?.talent![j]!.user!._id
              ) {
                candidatesOnTalentListSelected.push(candidates[i]);
              }
            }
          }
          setCandidatesFromTalentList(candidatesOnTalentListSelected);
          setEditTalentListMode(false);
          setNewTalentListCandidatesIds([]);
          setNewTalentListName("");
        } else {
          console.log(
            "can't land here, something is wrong! there isn't any exception to the rule :P"
          );
        }
      },
    }
  );

  // console.log("mostRelevantMemberNode = ", mostRelevantMemberNode);
  const handleTrainButtonClick = () => {
    setTrainModalOpen(true);
  };

  const handleCloseTrainModal = () => {
    setTrainModalOpen(false);
  };

  const handleSelectedTalentList = (list: TalentListType) => {
    const candidatesOnTalentListSelected: CandidateTypeSkillMatch[] = [];

    if (talentListToShow) {
      console.log("111 aaa");
      for (let i = 0; i < candidates.length; i++) {
        for (let j = 0; j < talentListToShow.talent!.length; j++) {
          if (
            candidates[i].user?._id === talentListToShow.talent![j]!.user!._id
          ) {
            candidatesOnTalentListSelected.push(candidates[i]);
          }
        }
      }
      setTalentListSelected(talentListToShow);
      setTalentListToShow(undefined);
      console.log({ talentListToShow });
      console.log({ talentListsAvailables });
    } else if (list._id !== "000") {
      console.log("1111 cccc");
      for (let i = 0; i < candidates.length; i++) {
        for (let j = 0; j < list.talent!.length; j++) {
          if (candidates[i].user?._id === list.talent![j]!.user!._id) {
            candidatesOnTalentListSelected.push(candidates[i]);
          }
        }
      }
      setTalentListSelected(list);
    } else {
      candidatesOnTalentListSelected.push(...candidates);
      console.log("1111 bbbb");
      setTalentListSelected({ _id: "000", name: "No list selected" });
    }
    // }

    setCandidatesFromTalentList(candidatesOnTalentListSelected);
  };

  const handleCreateNewListButton = () => {
    // console.log("2222");
    setTalentListSelected({ _id: "000", name: "No list selected" });
    setNewTalentListCreationMode(true);
    setCandidatesFromTalentList(candidates);
  };

  const handleEditTalentListButton = () => {
    setEditTalentListMode(true);
    setNewTalentListName(talentListSelected?.name!);
    setCandidatesFromTalentList(candidates);
    setNewTalentListCandidatesIds(
      talentListSelected?.talent!.map((t) => t?.user?._id!)!
    );
  };

  const handleCopyLink = () => {
    // const url = window.location.href;
    const url = window.location.origin + "/interview/" + positionID;

    navigator.clipboard.writeText(url);
    setNotificationOpen(true);
    setTimeout(() => {
      setNotificationOpen(false);
    }, 3000);
  };

  const handleCandidateCheckboxSelection = (candidate: CandidateType) => {
    setNewTalentListCandidatesIds((prev) => {
      const newCandidatesIds = [...prev];

      if (newCandidatesIds.includes(candidate.user?._id!)) {
        const index = newCandidatesIds.indexOf(candidate.user?._id!);

        newCandidatesIds.splice(index, 1);
      } else {
        newCandidatesIds.push(candidate.user?._id!);
      }

      return newCandidatesIds.filter((id) => id !== undefined || id !== null);
    });
  };

  const handleNewTalentListNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewTalentListName(e.target.value);
  };

  const handleSaveNewTalentListButton = async () => {
    if (!editTalentListMode) {
      toast.info("Saving new talent list..");
      const result = await createTalentListPosition({
        variables: {
          fields: {
            positionID: positionID,
            name: newTalentListName,
          },
        },
      });

      const lastTalentListIndex =
        result.data?.createTalentListPosition.talentList.length - 1;

      const newTalentListID =
        result.data?.createTalentListPosition.talentList[lastTalentListIndex]
          ._id;

      await updateUsersTalentListPosition({
        variables: {
          fields: {
            positionID: positionID,
            talentListID: newTalentListID,
            usersTalentList: newTalentListCandidatesIds,
          },
        },
      });
      toast.success("New talent list created!");
    } else {
      toast.info("Saving changes on talent list");
      await updateUsersTalentListPosition({
        variables: {
          fields: {
            positionID: positionID,
            talentListID: talentListSelected?._id!,
            usersTalentList: newTalentListCandidatesIds,
          },
        },
      });
      toast.success("Talent list updated correctly!");
    }
  };

  const handleShareTalentListButton = async () => {
    const url =
      window.location.origin +
      "/dashboard/" +
      positionID +
      "/" +
      talentListSelected?._id!;

    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="bg-background container mx-auto max-w-screen-2xl flex-grow px-2 py-4 sm:px-5">
      <div
        className={classNames(
          `z-20 transition-all duration-200 ease-in-out`,
          selectedUserId ? "w-[calc(50%-1rem)]" : "w-full"
        )}
      >
        <div className="mb-4 flex h-10 items-center">
          <h1 className="mr-6 text-2xl font-medium">
            {findPositionData && findPositionData.findPosition.name
              ? findPositionData.findPosition.name.charAt(0).toUpperCase() +
                findPositionData.findPosition.name.slice(1)
              : ""}{" "}
            Dashboard
          </h1>
          <Button
            size="sm"
            className="bg-soilBlue border-soilBlue mr-2 flex items-center !px-1 !py-0 !text-sm text-white hover:border-[#7A98E5] hover:bg-[#7A98E5]"
            variant="default"
            onClick={handleCopyLink}
          >
            <HiOutlineLink className="mr-1" />
            interview link
          </Button>
          {notificationOpen && (
            <span className="text-sm text-gray-400">Link copied!</span>
          )}
          <Button
            className="transition-bg relative ml-auto h-[36px] whitespace-nowrap !border-[#ff5656] pl-[16px] pr-[40px] font-bold !text-[#ff5656] duration-200 ease-in-out hover:!bg-[#ff5656] hover:!text-white hover:shadow-md hover:shadow-red-200"
            radius="pill"
            variant="secondary"
            onClick={handleTrainButtonClick}
          >
            Train Eden AI
            <div className="absolute -right-[2px] -top-[2px] flex h-[36px] w-[36px] items-center justify-center overflow-hidden rounded-full border-2 border-[#ff5656]">
              <div className="h-[40px] w-[40px] min-w-[40px]">
                <Image
                  src="https://pbs.twimg.com/profile_images/1595723986524045312/fqOO4ZI__400x400.jpg"
                  width={40}
                  height={40}
                  alt=""
                />
              </div>
            </div>
          </Button>
          {/* <Button
            variant="secondary"
            onClick={() => {
              router.push(`/train-ai/${positionID}`);
            }}
            >
            Train AI
          </Button> */}
        </div>
        <div className="">
          <div className="mb-4 flex items-center">
            <div className="mr-4 max-w-[200px]">
              {!newTalentListCreationMode ? (
                <SelectList
                  items={[
                    { _id: "000", name: "No list selected" },
                    ...talentListsAvailables,
                  ]}
                  onChange={handleSelectedTalentList}
                  newValue={talentListSelected ? talentListSelected : undefined}
                  isDisabled={editTalentListMode}
                />
              ) : (
                <TextField
                  onChange={handleNewTalentListNameChange}
                  placeholder="Name your custom list"
                  radius="pill-shadow"
                  required={true}
                  className="mt-0 h-[30px] !px-2 !py-1"
                />
              )}
            </div>
            <>
              {talentListSelected?._id === "000" ? (
                !newTalentListCreationMode ? (
                  <Button
                    className=""
                    variant="secondary"
                    size="sm"
                    onClick={handleCreateNewListButton}
                  >
                    Create New List
                  </Button>
                ) : (
                  <>
                    <Button
                      className="mr-2 px-4"
                      size="sm"
                      variant="primary"
                      onClick={handleSaveNewTalentListButton}
                      disabled={
                        newTalentListName === "" ||
                        newTalentListCandidatesIds.length === 0
                      }
                    >
                      Save
                    </Button>

                    {/* close button */}
                    <FaTimes
                      size={26}
                      className="cursor-pointer text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        setNewTalentListName("");
                        setNewTalentListCandidatesIds([]);
                        setNewTalentListCreationMode(false);
                      }}
                    />
                  </>
                )
              ) : !editTalentListMode ? (
                <div className="grid grid-cols-3 grid-rows-1 justify-items-center gap-4">
                  <MdIosShare
                    size={36}
                    className="mt-1 cursor-pointer rounded-full p-1 hover:border-2 hover:border-gray-500 "
                    onClick={handleShareTalentListButton}
                  />
                  <Button
                    className="mb-4 ml-auto pt-2"
                    variant="secondary"
                    size="md"
                    onClick={handleEditTalentListButton}
                  >
                    Edit
                  </Button>
                  <Button
                    className="pl-auto mb-4 ml-auto w-32 min-w-fit pt-2 text-xs"
                    variant="secondary"
                    onClick={handleCreateNewListButton}
                  >
                    Create new
                  </Button>
                </div>
              ) : (
                <Button
                  className="mb-4 ml-auto"
                  variant="secondary"
                  onClick={handleSaveNewTalentListButton}
                  disabled={
                    newTalentListName === "" ||
                    newTalentListCandidatesIds.length === 0
                  }
                >
                  Save
                </Button>
              )}
            </>
          </div>
        </div>
        <div className="grid grid-flow-row">
          <CandidatesTableList
            candidateIDRowSelected={selectedUserId || null}
            candidatesList={candidatesFromTalentList}
            fetchIsLoading={findPositionIsLoading}
            setRowObjectData={handleRowClick}
            listMode={
              newTalentListCreationMode
                ? ListModeEnum.creation
                : editTalentListMode
                ? ListModeEnum.edit
                : ListModeEnum.list
            }
            selectedIds={newTalentListCandidatesIds}
            handleChkSelection={handleCandidateCheckboxSelection}
          />
          {trainModalOpen ? (
            <div className="fixed inset-0 z-30 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center px-4">
                <div
                  className="fixed inset-0 transition-opacity"
                  aria-hidden="true"
                  onClick={handleCloseTrainModal}
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-xl">
                  <TrainQuestionsEdenAI
                    questions={questions}
                    positionID={[params![0]]}
                    setQuestions={setQuestions}
                    setTrainModalOpen={setTrainModalOpen}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div
        className={classNames(
          "absolute right-0 top-0 z-20 transform overflow-y-scroll transition-all duration-200 ease-in-out",
          selectedUserId ? "w-[50vw]" : "w-0"
        )}
      >
        <div className="scrollbar-hide h-[calc(100vh-4rem)] overflow-y-scroll bg-white shadow-md">
          {/* {selectedUserId ? ( */}
          <CandidateInfo
            key={selectedUserId || ""}
            memberID={selectedUserId || ""}
            percentage={selectedUserScore}
            summaryQuestions={selectedUserSummaryQuestions}
            mostRelevantMemberNode={mostRelevantMemberNode}
            candidate={candidates?.find(
              (candidate) =>
                candidate?.user?._id?.toString() == selectedUserId?.toString()
            )}
            onClose={() => {
              setSelectedUserId(null);
            }}
          />
          {/* ) : (
            <div className="w-full pt-20 text-center">
              <p className="text-gray-400">Select a candidate</p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

PositionCRM.getLayout = (page: any) => <AppUserLayout>{page}</AppUserLayout>;

export default PositionCRM;
