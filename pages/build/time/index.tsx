import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Text,
  VStack,
  useColorModeValue,
  Select,
} from "@chakra-ui/react";
import { ChevronLeftIcon, AddIcon, CopyIcon } from "@chakra-ui/icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { TimezoneConfig } from "@/types/types";
import { DEFAULT_TIMEZONE_CARDS_CONFIG } from "@/constants/constants";
import TimezoneConfigCard from "./configcard";
import TimezoneCard from "@/components/timezone/timezonecard";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../../../public/logo.png";

export default function TimeBuilder() {
  const router = useRouter();
  const [clockConfigs, setClockConfigs] = useState<TimezoneConfig[]>(
    DEFAULT_TIMEZONE_CARDS_CONFIG
  );
  const [stackDir, setStackDir] = useState<"column" | "row">("column");

  // Build link string same pattern
  const linkString = useMemo(() => {
    const dirSeg = `/dir=${stackDir}`;
    const clocksSeg = clockConfigs
      .map((cfg) => {
        const str = Object.entries(cfg)
          .map(([key, value]) => {
            if (key === "id") return undefined;
            if (typeof value === "boolean") {
              return value ? key : `!${key}`;
            }
            if (Array.isArray(value)) {
              return `${key}=${value.join(",")}`;
            }
            return `${key}=${value}`;
          })
          .filter(Boolean)
          .join("&&");
        return `/${str}`;
      })
      .join("");
    return dirSeg + clocksSeg;
  }, [clockConfigs, stackDir]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 150,
      },
    })
  );

  const configChangeHandler = (change: any, property: string, id: string) => {
    setClockConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [property]: change } : c))
    );
  };

  const newHandler = () => {
    setClockConfigs((prev) => [
      ...prev,
      {
        ...DEFAULT_TIMEZONE_CARDS_CONFIG[0],
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      },
    ]);
  };

  const deleteHandler = (id: string) => {
    setClockConfigs((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setClockConfigs((items) => {
        const oldIdx = items.findIndex((i) => i.id === active.id);
        const newIdx = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIdx, newIdx);
      });
    }
  };

  const bgSidebar = useColorModeValue("gray.100", "gray.700");

  return (
    <Flex alignItems="center" gap={2} wrap="wrap">
      {/* Sidebar */}
      <Flex
        p={10}
        bg={bgSidebar}
        flexGrow={1}
        direction="column"
        justify="space-between"
        minHeight="100vh"
        gap={7}
      >
        <Image
          height={75}
          width={75}
          src={logo}
          alt="wotion logo"
          onClick={() => router.push("/")}
          style={{ cursor: "pointer" }}
        />
        <Flex direction="row" alignItems="center">
          <IconButton
            aria-label="Return to dashboard"
            icon={<ChevronLeftIcon />}
            onClick={() => router.push("/")}
          />
          <Text pl={3} fontSize="lg">
            Return to Dashboard
          </Text>
        </Flex>
        <Heading size="md">🕒 World Clock Widget Builder</Heading>
        <Box>
          <Text fontSize="md">Widget Orientation</Text>
          <Select value={stackDir} onChange={(e)=> setStackDir(e.target.value as any)}>
            <option value="column">Vertical</option>
            <option value="row">Horizontal</option>
          </Select>
        </Box>

        {/* Config list */}
        <Flex direction="column" overflowY="auto" maxHeight="70vh">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <SortableContext
              items={clockConfigs}
              strategy={verticalListSortingStrategy}
            >
              {clockConfigs.map((w) => (
                <TimezoneConfigCard
                  key={w.id}
                  id={w.id}
                  widget={w}
                  configChangeHandler={configChangeHandler}
                  deleteHandler={deleteHandler}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Flex>

        {clockConfigs.length < 6 && (
          <Button
            borderRadius="lg"
            size="md"
            colorScheme="gray"
            leftIcon={<AddIcon />}
            variant="outline"
            minHeight="80px"
            borderWidth="2px"
            onClick={newHandler}
          >
            New Clock
          </Button>
        )}
        <Spacer />

        {/* Link copy */}
        <Popover>
          <PopoverTrigger>
            <ButtonGroup
              size="sm"
              isAttached
              borderRadius="lg"
              colorScheme="gray"
              minHeight="60px"
              borderWidth="3px"
              display="flex"
            >
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://wotion.co/widgets/time${linkString}`
                  );
                }}
                flexBasis={0}
                flexGrow={1}
                minHeight="60px"
              >
                <Box isTruncated maxW={500} textDecoration="underline">
                  {`https://wotion.co/widgets/time${linkString}`}
                </Box>
              </Button>
              <IconButton
                flexBasis="80px"
                size="lg"
                minHeight="60px"
                aria-label="Copy to clipboard"
                icon={<CopyIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://wotion.co/widgets/time${linkString}`
                  );
                }}
                variant="CopyButton"
              />
            </ButtonGroup>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>Copied to Clipboard!</PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>

      {/* Preview panel */}
      <Flex flexGrow={4} justifyContent="center" alignItems="center">
        {stackDir === "column" ? (
          <VStack gap={5} padding={1}>
            {clockConfigs.map((cfg) => (
              <TimezoneCard key={cfg.id} config={cfg} />
            ))}
          </VStack>
        ) : (
          <Flex direction="row" gap={5} padding={1} wrap="wrap">
            {clockConfigs.map((cfg) => (
              <TimezoneCard key={cfg.id} config={cfg} />
            ))}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
} 