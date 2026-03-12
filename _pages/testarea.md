---
permalink: /testarea/
layout: page
---

<style>
  body {
    background-image: url('{{ "/assets/img/inaroom.jpg" | relative_url }}');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    margin: 0;
    padding: 0;
  }
  .site-header, .site-footer {
    display: none !important;
  }
  .page-content, .wrapper {
    background: transparent !important;
    padding: 0 !important;
    border: none !important;
  }
  .mixer-controls {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 50px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
  }
  .track-control {
    width: 100%;
  }
  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    background: transparent;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    margin-top: -7px;
    border: 1px solid black;
  }
  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 2px;
    cursor: pointer;
    background: black;
  }
  input[type=range]:focus {
    outline: none;
  }
  #start-mix-btn {
    display: block;
    margin: 40px auto;
    padding: 10px 20px;
    font-size: 1em;
    background: black;
    color: white;
    border: 1px solid white;
    cursor: pointer;
    font-family: inherit;
    text-transform: lowercase;
  }
  #start-mix-btn:hover {
    background: white;
    color: black;
  }
</style>

<button id="start-mix-btn">initialize</button>

<div class="mixer-controls" id="mixer-container">
  {% for file in site.static_files %}
    {% if file.extname == '.ogg' and file.path contains '/assets/audio/' %}
    <div class="track-control">
      <input 
        type="range" 
        class="volume-slider" 
        data-track-url="{{ file.path | relative_url }}"
        min="-60" 
        max="6" 
        value="-60" 
        step="0.1"
      >
    </div>
    {% endif %}
  {% endfor %}
</div>

<script src="{{ '/assets/js/looper.js' | relative_url }}"></script>
