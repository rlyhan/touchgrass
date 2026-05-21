import {CheckmarkIcon, ChevronDownIcon, CloseIcon, SearchIcon} from '@sanity/icons'
import {Box, Button, Card, Flex, Stack, Text, TextInput} from '@sanity/ui'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

export type MultiSelectOption = {
  title: string
  value: string
}

export type MultiSelectGroup = {
  label: string | null
  options: MultiSelectOption[]
}

interface MultiSelectDropdownProps {
  value: string[]
  onChange: (next: string[]) => void
  groups: MultiSelectGroup[]
  placeholder?: string
  readOnly?: boolean
}

export function MultiSelectDropdown({
  value,
  onChange,
  groups,
  placeholder = 'Select…',
  readOnly,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (target && wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const selectedSet = useMemo(() => new Set(value ?? []), [value])

  const titleByValue = useMemo(() => {
    const map = new Map<string, string>()
    for (const group of groups) {
      for (const opt of group.options) map.set(opt.value, opt.title)
    }
    return map
  }, [groups])

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return groups
    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter((opt) => opt.title.toLowerCase().includes(q)),
      }))
      .filter((group) => group.options.length > 0)
  }, [groups, query])

  const toggleValue = useCallback(
    (val: string) => {
      if (readOnly) return
      const current = value ?? []
      onChange(current.includes(val) ? current.filter((v) => v !== val) : [...current, val])
    },
    [onChange, value, readOnly],
  )

  const removeValue = useCallback(
    (val: string) => {
      if (readOnly) return
      onChange((value ?? []).filter((v) => v !== val))
    },
    [onChange, value, readOnly],
  )

  const selectedCount = (value ?? []).length
  const triggerLabel = selectedCount === 0 ? placeholder : `${selectedCount} selected`

  return (
    <Stack space={3} ref={wrapperRef}>
      <Box style={{position: 'relative'}}>
        <Button
          mode="ghost"
          tone="default"
          onClick={() => setOpen((prev) => !prev)}
          disabled={readOnly}
          iconRight={ChevronDownIcon}
          text={triggerLabel}
          style={{width: '100%', justifyContent: 'space-between'}}
        />
        {open && (
          <Card
            radius={2}
            shadow={3}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              zIndex: 10,
              overflow: 'hidden',
            }}
          >
            <Card padding={2} borderBottom>
              <TextInput
                icon={SearchIcon}
                placeholder="Search…"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                clearButton={query.length > 0}
                onClear={() => setQuery('')}
                radius={2}
              />
            </Card>
            <Box style={{maxHeight: 280, overflowY: 'auto'}}>
              <Box paddingY={2}>
                {filteredGroups.length === 0 ? (
                  <Box padding={3}>
                    <Text size={1} muted>
                      No options found
                    </Text>
                  </Box>
                ) : (
                  filteredGroups.map((group, groupIndex) => (
                    <Box key={group.label ?? `group-${groupIndex}`}>
                      {group.label && (
                        <Card
                          paddingX={3}
                          paddingY={2}
                          tone="transparent"
                          borderTop={groupIndex > 0}
                        >
                          <Text size={1} weight="semibold" muted>
                            {group.label}
                          </Text>
                        </Card>
                      )}
                    {group.options.map((opt) => {
                      const checked = selectedSet.has(opt.value)
                      return (
                        <Card
                          as="button"
                          key={opt.value}
                          onClick={() => toggleValue(opt.value)}
                          padding={3}
                          radius={0}
                          tone={checked ? 'primary' : 'default'}
                          style={{
                            width: '100%',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'block',
                          }}
                        >
                          <Flex align="center" gap={3}>
                            <Box
                              style={{
                                width: 16,
                                height: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {checked && <CheckmarkIcon />}
                            </Box>
                            <Text size={1}>{opt.title}</Text>
                          </Flex>
                        </Card>
                      )
                    })}
                  </Box>
                ))
              )}
              </Box>
            </Box>
          </Card>
        )}
      </Box>
      {selectedCount > 0 && (
        <Flex wrap="wrap" gap={2}>
          {(value ?? []).map((val) => {
            const title = titleByValue.get(val) ?? val
            return (
              <Card key={val} radius={2} padding={1} paddingLeft={3} tone="primary">
                <Flex align="center" gap={1}>
                  <Text size={1}>{title}</Text>
                  <Button
                    mode="bleed"
                    padding={1}
                    fontSize={0}
                    icon={CloseIcon}
                    onClick={() => removeValue(val)}
                    aria-label={`Remove ${title}`}
                    disabled={readOnly}
                  />
                </Flex>
              </Card>
            )
          })}
        </Flex>
      )}
    </Stack>
  )
}
