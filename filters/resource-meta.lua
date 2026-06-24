local function escape_html(text)
  local escaped = text
    :gsub("&", "&amp;")
    :gsub("<", "&lt;")
    :gsub(">", "&gt;")
    :gsub('"', "&quot;")
    :gsub("'", "&#39;")

  return escaped
end

local function stringify_meta(value)
  if value == nil then
    return nil
  end

  local value_type = pandoc.utils.type(value)

  if value_type == "MetaList" or value_type == "List" then
    local parts = {}

    for i = 1, #value do
      local item = value[i]
      parts[#parts + 1] = pandoc.utils.stringify(item)
    end

    return table.concat(parts, ", ")
  end

  return pandoc.utils.stringify(value)
end

local function meta_list(value)
  if value == nil then
    return {}
  end

  local value_type = pandoc.utils.type(value)

  if value_type == "MetaList" or value_type == "List" then
    local parts = {}

    for i = 1, #value do
      local item = value[i]
      parts[#parts + 1] = pandoc.utils.stringify(item)
    end

    return parts
  end

  return { pandoc.utils.stringify(value) }
end

local function format_list(values)
  if values == nil or #values == 0 then
    return nil
  end

  local escaped = {}

  for _, value in ipairs(values) do
    if value ~= nil and value ~= "" then
      escaped[#escaped + 1] = escape_html(value)
    end
  end

  if #escaped == 0 then
    return nil
  end

  return table.concat(escaped, ", ")
end

local function format_links(values)
  if values == nil or #values == 0 then
    return nil
  end

  local links = {}

  for _, value in ipairs(values) do
    if value ~= nil and value ~= "" then
      local safe = escape_html(value)

      if value:match("^https?://") then
        links[#links + 1] = string.format('<a href="%s">%s</a>', safe, safe)
      else
        links[#links + 1] = safe
      end
    end
  end

  if #links == 0 then
    return nil
  end

  return table.concat(links, "<br>")
end

local function make_item(label, value, css_class)
  if value == nil or value == "" then
    return ""
  end

  local class_attr = "resource-meta__value"
  if css_class ~= nil and css_class ~= "" then
    class_attr = class_attr .. " " .. css_class
  end

  return string.format(
    '<span class="resource-meta__item"><span class="resource-meta__label">%s</span><span class="%s">%s</span></span>',
    escape_html(label),
    class_attr,
    value
  )
end

function Pandoc(doc)
  local resource_type = stringify_meta(doc.meta.resource_type)

  if resource_type == nil or resource_type == "" then
    return doc
  end

  local status = stringify_meta(doc.meta.status)
  local reviewed_on = stringify_meta(doc.meta.reviewed_on)
  local contributors = format_list(meta_list(doc.meta.contributors))
  local tags = format_list(meta_list(doc.meta.tags))

  local pieces = {}

  if status ~= nil and status:lower() == "draft" then
    pieces[#pieces + 1] = '<div class="draft-banner">In development: this page is public to support transparent iteration and review.</div>'
  end

  pieces[#pieces + 1] = '<div class="resource-meta">'
  pieces[#pieces + 1] = make_item("Resource type", escape_html(resource_type))

  local status_class = nil
  if status ~= nil and status ~= "" then
    status_class = "is-" .. status:lower():gsub("%s+", "-")
  end

  pieces[#pieces + 1] = make_item("Status", status and escape_html(status) or nil, status_class)
  pieces[#pieces + 1] = make_item("Last reviewed", reviewed_on and escape_html(reviewed_on) or nil)
  pieces[#pieces + 1] = make_item("Contributors", contributors)
  pieces[#pieces + 1] = make_item("Tags", tags)
  pieces[#pieces + 1] = "</div>"

  table.insert(doc.blocks, 1, pandoc.RawBlock("html", table.concat(pieces, "")))
  return doc
end
