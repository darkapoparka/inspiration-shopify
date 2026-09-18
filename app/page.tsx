import { DealerAdmin } from "@/components/dealer-admin";
import { DemoProvider } from "@/components/demo-context";

export default function HomePage() {
  return (
    <DemoProvider>
      <DealerAdmin />
    </DemoProvider>
  );
}
