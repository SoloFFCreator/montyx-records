import { usePageMeta } from "@/components/SiteLayout";
import DistributionLanding from "@/components/distribution/DistributionLanding";

export default function Home() {
  usePageMeta(
    "MONTYX RECORDS Distribution — Music from Nepal to the world",
    "Independent music distribution from Nepal. Confirm current destination support and territory availability with MONTYX before scheduling a release."
  );

  return <DistributionLanding />;
}
