/* eslint-disable camelcase */
import {
  Maybe,
  SkillCategory,
  SkillType_Member,
} from "@eden/package-graphql/generated";
import { Badge, TextHeading3 } from "@eden/package-ui";

// import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/outline";
// import { useState } from "react";
import { trimParentheses } from "../../../utils/trim-parentheses";

export interface SkillCategoryListProps {
  categories?: SkillCategory[];
  skills?: Maybe<SkillType_Member>[] | undefined;
  colorRGB?: string;
  closeButton?: boolean;
  overflowNumber?: number;
  // eslint-disable-next-line no-unused-vars
  handleDeleteSkill?: (val: Maybe<SkillType_Member> | undefined) => void;
}
export const SkillCategoryList: React.FC<SkillCategoryListProps> = ({
  skills,
  categories,
  colorRGB,
  closeButton = false,
  // overflowNumber = 6,
  handleDeleteSkill,
}) => {
  // const [seeMore, setSeeMore] = useState(false);

  const badges = (_skills: Maybe<SkillType_Member>[]) =>
    _skills?.map(
      (skill: Maybe<SkillType_Member> | undefined, index: number) => (
        <Badge
          key={index}
          text={trimParentheses(skill?.skillInfo?.name || "")}
          colorRGB={colorRGB}
          className={`font-Inter text-sm`}
          closeButton={closeButton}
          onClose={() => {
            if (handleDeleteSkill) handleDeleteSkill(skill);
          }}
          cutText={16}
        />
      )
    );

  return (
    <div>
      {categories?.map((category, index) => (
        <div key={index}>
          <TextHeading3>{category.name}:</TextHeading3>
          {badges(
            skills!.filter((_skill) =>
              category.skills?.some(
                (__skill) => _skill?.skillInfo?._id === __skill?._id
              )
            )
          )}
        </div>
      ))}

      <TextHeading3>Others:</TextHeading3>
      {/* {categories?.map((category, index) => (

      ))} */}
      {/* <div>
        {badges?.slice(0, overflowNumber)}
        {seeMore ? badges?.slice(overflowNumber) : null}
      </div>
      {badges && badges.length > overflowNumber && (
        <p
          className="cursor-pointer text-center text-sm"
          onClick={() => setSeeMore(!seeMore)}
        >
          {`see ${seeMore ? "less" : "more"} skills`}
          <span>
            {seeMore ? (
              <ChevronUpIcon width={16} className="ml-2 inline" />
            ) : (
              <ChevronDownIcon width={16} className="ml-2 inline" />
            )}
          </span>
        </p>
      )} */}
    </div>
  );
};