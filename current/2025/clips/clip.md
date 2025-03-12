---
pagination:
  data: collections.eventClips
  size: 1
  alias: clip
permalink: "{{clip.permalink}}/"
---

{% set event = collections.allEvents.get(clip.key) %}

<h1>{{clip.data.title}}</h1>

<ul>
{% for host in clip.data.hosts %}
  <li>{{ macro.hostName(host) }}</li>
{% endfor %}
</ul>
