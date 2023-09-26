import clsx from "clsx";

export interface SkillSliderProps {
  name?: string;
  score?: number;
}

export const SkillSlider = ({ name, score }: SkillSliderProps) => {
  score = 2;
  name = "Strong in React and Angular";
  //The score is 1-10. I am converting the score to % with an additional "0". 1 = 10%, 2 = 20% .... 10 = 100%
  const btnClasses = clsx(
    "absolute top-1/2 h-5 w-5 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500",
    `left-${score}0%`
  );

  return (
    <div className="relative flex items-center  space-x-2 ">
      <h3> {name} </h3>
      <div className="relative mt-1 h-[5px] w-52 rounded-lg bg-gray-600">
        <div className={btnClasses}></div>
      </div>
    </div>
  );
};
