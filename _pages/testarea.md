---
permalink: /testarea/
list_title: "testarea"
title: "testarea"
layout: page
---

<style>
  .mixer-controls {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }
  .track-control {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(0,0,0,0.2);
    padding: 15px;
    border-radius: 8px;
  }
  .track-control label {
    margin-bottom: 10px;
    font-size: 0.9em;
    font-weight: bold;
    text-align: center;
    word-break: break-all;
  }
  /* Vertical slider styling */
  input[type=range][orient=vertical] {
    writing-mode: bt-lr; /* IE */
    -webkit-appearance: slider-vertical; /* WebKit */
    width: 20px;
    height: 150px;
    padding: 0 5px;
  }
  #start-mix-btn {
    display: block;
    margin: 20px auto;
    padding: 15px 30px;
    font-size: 1.2em;
    background: #444;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.2s;
  }
  #start-mix-btn:hover {
    background: #666;
  }
  #start-mix-btn:disabled {
    background: #333;
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

<h2>accidental-v1</h2>

<button id="start-mix-btn">Initialize</button>

<div class="mixer-controls" id="mixer-container">
  {% for file in site.static_files %}
    {% if file.extname == '.ogg' and file.path contains '/assets/audio/' %}
    <div class="track-control">
      <label for="track-{{ forloop.index }}">{{ file.basename }}</label>
      <input 
        type="range" 
        id="track-{{ forloop.index }}" 
        class="volume-slider" 
        data-track-url="{{ file.path | relative_url }}"
        min="-60" 
        max="6" 
        value="-60" 
        step="0.1"
        orient="vertical"
        disabled
      >
      <span class="db-readout">-Inf dB</span>
    </div>
    {% endif %}
  {% endfor %}
</div>

<script src="{{ '/assets/js/looper.js' | relative_url }}"></script>
