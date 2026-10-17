import * as React from "react";
import { GoogleMapsView } from "@/components/maps/google-maps-view";

export default function PetaRoutePage() {
  return (
    <div className="w-full h-[calc(100vh-64px)] overflow-hidden">
      <GoogleMapsView showMobileNav={false} />
    </div>
  );
}
