import { TimezoneConfig } from "@/types/types";
import { useRouter } from "next/router";
import { Box, Flex, Text, VStack, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import TimezoneCard from "@/components/timezone/timezonecard";

const isTimezoneConfig = (obj: any): obj is TimezoneConfig => {
  if (typeof obj !== "object" || obj === null) return false;
  if (
    typeof obj.id !== "string" ||
    typeof obj.tz !== "string" ||
    typeof obj.label !== "string" ||
    !Array.isArray(obj.team) ||
    typeof obj.format24 !== "boolean"
  )
    return false;
  return true;
};

export default function TimeWidget() {
  const router = useRouter();
  const [configs, setConfigs] = useState<TimezoneConfig[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [layout, setLayout] = useState<"row" | "column">("column");

  useEffect(() => {
    let slugs = router.query.slug;
    if (typeof slugs === "string") slugs = [slugs];

    if (slugs) {
      let dir: "row" | "column" = "column";
      const slugArr = [...(slugs as string[])];
      if (slugArr.length && slugArr[0].startsWith("dir=")) {
        dir = slugArr[0].split("=")[1] === "row" ? "row" : "column";
        slugArr.shift();
      }

      const formatted: TimezoneConfig[] = slugArr.map((str) => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        const pairs = str.split("&&");
        let obj: any = { id, label: "", team: [] };
        pairs.forEach((pair) => {
          const parts = pair.split("=");
          if (parts.length > 1) {
            const key = parts[0];
            const value = parts[1];
            if (key === "team") {
              obj[key] = value ? value.split(",") : [];
            } else {
              obj[key] = value;
            }
          } else if (pair[0] === "!") {
            obj[pair.slice(1)] = false;
          } else {
            obj[pair] = true;
          }
        });
        // defaults if missing
        obj.label = obj.label || obj.tz;
        obj.format24 = obj.format24 !== undefined ? obj.format24 : true;
        if (!obj.team) obj.team = [];
        if (!obj.layout) obj.layout = "vertical";
        if (obj.compact === undefined) obj.compact = false;
        if (isTimezoneConfig(obj)) {
          return obj;
        }
        setError(true);
        return obj;
      });
      setConfigs(formatted);
      setLayout(dir);
    }
  }, [router.query.slug]);

  return (
    <Box height="100vh" width="100vw">
      {error ? (
        <Text>Failed to render.</Text>
      ) : (
        {layout === "column" ? (
          <Flex width="100%" height="100%" direction="column" gap={5} p={2}>
            <VStack gap={5}>
              {configs.map((cfg) => (
                <TimezoneCard key={cfg.id} config={cfg} />
              ))}
            </VStack>
          </Flex>
        ) : (
          <Flex width="100%" height="100%" direction="row" gap={5} p={2} wrap="wrap">
            {configs.map((cfg) => (
              <TimezoneCard key={cfg.id} config={cfg} />
            ))}
          </Flex>
        )}
      )}
    </Box>
  );
} 