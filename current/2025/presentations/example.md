---
title: Example presentation
revealjsOptions:
    controls: false
    # autoSlide: 5000
    # loop: true
    # transition: fade
injectStyles: >
    .redlists ul {
        background: red;
    }
---

{% slide %}
## To Be Determined
We are looking for someone taking over.
{% endslide %}

{% slide {'class': 'redlists'} %}
# This seems to be working
## I'm nicely surprised
* can
* we
* have
* lists?
{% endslide %}


{% verticalslides %}
{% slide %}
# Vertical slides
{% endslide %}
{% slide %}
## Is this workin
Would be cool
{% endslide %}
{% endverticalslides %}
