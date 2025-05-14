import {
  Box,
  Flex,
  Text,
  Input,
  Switch,
  IconButton,
  Spacer,
  FormControl,
  FormLabel,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import { DeleteIcon, HamburgerIcon } from "@chakra-ui/icons";
import { TimezoneConfig } from "@/types/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TimezoneConfigCard({
  id,
  widget,
  configChangeHandler,
  deleteHandler,
}: {
  id: string;
  widget: TimezoneConfig;
  configChangeHandler: (val: any, prop: string, id: string) => void;
  deleteHandler: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Flex
        bg={useColorModeValue("gray.100", "gray.600")}
        direction="row"
        alignItems="center"
        borderRadius="lg"
        borderWidth="2px"
        mb={4}
        p={5}
        gap={4}
      >
        <Box cursor="grab" color="gray.500" {...listeners} {...attributes} pr={2}>
          <HamburgerIcon />
        </Box>
        <Box display="flex" flexDirection="column" gap={4} flexGrow={1}>
          <Box display="flex" gap={4}>
            <Box>
              <Text fontSize="md">Timezone (IANA)</Text>
              <Input
                value={widget.tz}
                placeholder="America/Los_Angeles"
                onChange={(e) =>
                  configChangeHandler(e.target.value, "tz", widget.id)
                }
              />
            </Box>
            <Box>
              <Text fontSize="md">Label</Text>
              <Input
                value={widget.label}
                placeholder="PST"
                onChange={(e) =>
                  configChangeHandler(e.target.value, "label", widget.id)
                }
              />
            </Box>
          </Box>
          <Box>
            <Text fontSize="md">Team (comma-separated)</Text>
            <Input
              defaultValue={widget.team.join(", ")}
              placeholder="Tom,Bob,Ada"
              onBlur={(e) =>
                configChangeHandler(
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                  "team",
                  widget.id
                )
              }
            />
          </Box>
          <Box display="flex" gap={4}>
            <Box>
              <Text fontSize="md">Layout</Text>
              <Select w="150px"
                value={widget.layout || "vertical"}
                onChange={(e) =>
                  configChangeHandler(e.target.value, "layout", widget.id)
                }
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </Select>
            </Box>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="compact-toggle" mb="0">
                Compact
              </FormLabel>
              <Switch
                id="compact-toggle"
                isChecked={widget.compact || false}
                size="lg"
                onChange={() =>
                  configChangeHandler(!widget.compact, "compact", widget.id)
                }
              />
            </FormControl>
          </Box>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="toggle-24" mb="0">
              24-Hour Format
            </FormLabel>
            <Switch
              id="toggle-24"
              isChecked={widget.format24}
              size="lg"
              onChange={() =>
                configChangeHandler(!widget.format24, "format24", widget.id)
              }
            />
          </FormControl>
        </Box>
        <Spacer />
        <IconButton
          aria-label="Delete clock"
          icon={<DeleteIcon />}
          onClick={() => deleteHandler(widget.id)}
          variant="CopyButton"
        />
      </Flex>
    </Box>
  );
} 