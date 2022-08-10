export interface TextHeading3Props {
  children?: React.ReactNode;
  className?: string;
}

export const TextHeading3 = ({ children, className }: TextHeading3Props) => {
  return (
    <h1 className={`text-soilHeading3 font-poppins font-medium ${className}`}>
      {children}
    </h1>
  );
};
