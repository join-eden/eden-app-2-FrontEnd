import { render } from "../../../utils/jest-apollo";
import { LaunchProjectContainer } from ".";

describe("LaunchProjectContainer", () => {
  it("renders without throwing", () => {
    const { container } = render(<LaunchProjectContainer />);

    expect(container).toBeInTheDocument();
  });
});
