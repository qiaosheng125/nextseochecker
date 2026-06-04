import type { Metadata } from "next";
import CheckerApp from "./CheckerApp";

export const metadata: Metadata = {
  alternates: {
    canonical: "/"
  }
};

export default function HomePage() {
  return <CheckerApp />;
}
