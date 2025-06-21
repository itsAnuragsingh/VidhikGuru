"use client";

import { UserButton, useUser } from "@civic/auth/react";
import { useEffect } from "react";

export default function CivicUserButton() {
  const user = useUser();
    if (user?.user) {
      console.log(" Authenticated Civic User:", user.user);
    }
    else {
      console.log("No authenticated Civic user found.");
    }
  return (
    <div className="fixed top-4 right-4 z-50">
      <UserButton />
    </div>
  );
}
