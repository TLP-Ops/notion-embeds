import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaUserFriends } from "react-icons/fa";

import { TimezoneConfig } from "@/types/types";

function formatTime(date: Date, format24: boolean) {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: !format24,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

function formatDate(date: Date) {
  return date.toLocaleDateString();
}

export default function TimezoneCard({
  config,
}: {
  config: TimezoneConfig;
}) {
  const [now, setNow] = useState<Date>(new Date());
  const bg = useColorModeValue("gray.100", "gray.700");

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute time in target timezone
  let zonedDate: Date;
  try {
    const localeTime = now.toLocaleString("en-US", { timeZone: config.tz });
    zonedDate = new Date(localeTime);
  } catch (e) {
    zonedDate = now; // fallback
  }

  const timeStr = formatTime(zonedDate, config.format24);
  const dateStr = formatDate(zonedDate);
  const tooltipLabel =
    config.team && config.team.length > 0
      ? config.team.join(", ")
      : "No team members";

  const vertical = config.compact ? false : config.layout !== "horizontal";
  const fontSizeTime = config.compact ? "lg" : vertical ? "2xl" : "2xl";
  const fontSizeLabel = config.compact ? "sm" : "md";

  return (
    <Box
      bg={bg}
      p={config.compact ? 2 : 4}
      borderRadius="lg"
      display="flex"
      flexDirection={vertical ? "column" : "row"}
      alignItems="center"
      position="relative"
      gap={vertical ? 0 : 3}
      maxW="100%"
    >
      {vertical ? (
        <Tooltip label={tooltipLabel} hasArrow placement="top">
          <Box position="absolute" top={2} right={2} cursor="default">
            <FaUserFriends />
          </Box>
        </Tooltip>
      ) : (
        <Tooltip label={tooltipLabel} hasArrow placement="top">
          <Box cursor="default" mr={2} flexShrink={0}>
            <FaUserFriends />
          </Box>
        </Tooltip>
      )}

      <Heading
        size={fontSizeLabel}
        flexShrink={0}
        flexGrow={vertical ? undefined : 1}
        whiteSpace="nowrap"
        fontFamily="'Public Sans', sans-serif"
      >
        {config.label || config.tz}
      </Heading>
      <Heading fontSize={fontSizeTime} flexShrink={0} fontFamily="'Source Code Pro', monospace">
        {timeStr}
      </Heading>
      {!config.compact && vertical && (
        <Text color="gray.500" fontFamily="'Source Code Pro', monospace">{dateStr}</Text>
      )}
    </Box>
  );
} 