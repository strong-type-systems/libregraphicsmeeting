---
pagination:
  data: collections.eventClips
  size: 1
  alias: clip
permalink: "{{clip.permalink}}/"
---

{% set event = collections.allEvents.get(clip.key) %}
# {{clip.data.title}}
<ul>
{% for host in clip.data.hosts %}
  <li>{{ macro.hostName(host) }}</li>
{% endfor %}
</ul>
