import { groupEvents } from "./github-events";
import { SampleEvents } from "./github-events.testdata";

test("Groups events by private/public and by repository", () => {
    const grouped = groupEvents(SampleEvents);
    expect(grouped.length).toBe(5);
});
