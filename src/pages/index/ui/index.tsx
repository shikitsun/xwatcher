import { ISyncPair } from "@/entities/syncs/model";
import SyncsDirInputModal from "@/features/syncs-dir-input/ui";
import { useState } from "react";

export default function IndexPage() {
  const [pairs, setPairs] = useState<ISyncPair[]>([]);

  return (
    <article>
      <SyncsDirInputModal onLoad={setPairs} />
    </article>
  );
}
