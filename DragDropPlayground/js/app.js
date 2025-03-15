$(function() {
    let elementIdCounter = 0;
    let playgroundState = [];
    let selectedElement = null;
  
    // Make sidebar elements draggable
    $('.draggable-element').draggable({
      helper: 'clone'
    });
  
    // Make playground droppable
    $('#playground').droppable({
      accept: '.draggable-element',
      drop: function(event, ui) {
        const type = ui.helper.data('type');
        const offset = $(this).offset();
        const x = ui.offset.left - offset.left;
        const y = ui.offset.top - offset.top;
  
        addElement(type, x, y);
      }
    });
  
    // Add element to playground
    function addElement(type, x, y) {
      const id = 'element-' + elementIdCounter++;
      let element = $('<div></div>').addClass('playground-item').attr('id', id);
  
      let width = 100;
      let height = 50;
  
      let data = {
        id,
        type,
        x,
        y,
        width,
        height
      };
  
      if (type === 'text') {
        data.text = 'Sample Text';
        element.text(data.text).css({
          fontSize: '16px'
        });
      } else if (type === 'image') {
        data.src = 'https://via.placeholder.com/100x50';
        element.html(`<img src="${data.src}" width="${width}" height="${height}">`);
      } else if (type === 'shape') {
        data.fill = '#ff0000';
        element.html(`<svg width="${width}" height="${height}">
                        <circle cx="50" cy="25" r="20" fill="${data.fill}" />
                      </svg>`);
      }
  
      element.css({
        left: x,
        top: y,
        width: width,
        height: height
      });
  
      element.draggable({
        containment: '#playground',
        stop: function(event, ui) {
          data.x = ui.position.left;
          data.y = ui.position.top;
        }
      });
  
      element.click(function(e) {
        e.stopPropagation(); // prevent deselection
        selectElement(element);
      });
  
      $('#playground').append(element);
      playgroundState.push(data);
      selectElement(element);
    }
  
    // Select and edit element properties
    function selectElement(el) {
      $('.playground-item').removeClass('selected');
      el.addClass('selected');
      selectedElement = el;
  
      let id = el.attr('id');
      let data = playgroundState.find(item => item.id === id);
  
      let content = `
        <label>Width:
          <input type="number" id="propWidth" value="${data.width}">
        </label>
        <label>Height:
          <input type="number" id="propHeight" value="${data.height}">
        </label>
      `;
  
      if (data.type === 'text') {
        content += `
          <label>Text:
            <input type="text" id="propText" value="${data.text}">
          </label>
          <label>Font Size:
            <input type="number" id="propFontSize" value="${parseInt(el.css('font-size'))}">
          </label>
        `;
      }
  
      if (data.type === 'image') {
        content += `
          <label>Image URL:
            <input type="text" id="propSrc" value="${data.src}">
          </label>
        `;
      }
  
      if (data.type === 'shape') {
        content += `
          <label>Fill Color:
            <input type="color" id="propFill" value="${data.fill}">
          </label>
        `;
      }
  
      $('#propertiesContent').html(content);
  
      // Events for editing properties
      $('#propWidth').on('input', function() {
        let width = $(this).val();
        el.css('width', width + 'px');
        data.width = width;
  
        if (data.type === 'image') {
          el.find('img').attr('width', width);
        } else if (data.type === 'shape') {
          el.find('svg').attr('width', width);
        }
      });
  
      $('#propHeight').on('input', function() {
        let height = $(this).val();
        el.css('height', height + 'px');
        data.height = height;
  
        if (data.type === 'image') {
          el.find('img').attr('height', height);
        } else if (data.type === 'shape') {
          el.find('svg').attr('height', height);
        }
      });
  
      $('#propText').on('input', function() {
        let text = $(this).val();
        el.text(text);
        data.text = text;
      });
  
      $('#propFontSize').on('input', function() {
        let fontSize = $(this).val();
        el.css('font-size', fontSize + 'px');
      });
  
      $('#propSrc').on('input', function() {
        let src = $(this).val();
        el.html(`<img src="${src}" width="${data.width}" height="${data.height}">`);
        data.src = src;
      });
  
      $('#propFill').on('input', function() {
        let fill = $(this).val();
        el.find('circle').attr('fill', fill);
        data.fill = fill;
      });
    }
  
    // Deselect when clicking elsewhere
    $('#playground').click(function() {
      $('.playground-item').removeClass('selected');
      selectedElement = null;
      $('#propertiesContent').html('Select an element to edit its properties');
    });
  
    // Save state
    $('#saveBtn').click(function() {
      localStorage.setItem('playgroundState', JSON.stringify(playgroundState));
      alert('Playground state saved!');
    });
  
    // Load state
    $('#loadBtn').click(function() {
      let loadedState = JSON.parse(localStorage.getItem('playgroundState'));
      if (!loadedState) {
        alert('No saved state found!');
        return;
      }
  
      playgroundState = loadedState;
      $('#playground').empty();
  
      playgroundState.forEach(data => {
        let element = $('<div></div>').addClass('playground-item').attr('id', data.id);
  
        if (data.type === 'text') {
          element.text(data.text).css({
            fontSize: '16px'
          });
        } else if (data.type === 'image') {
          element.html(`<img src="${data.src}" width="${data.width}" height="${data.height}">`);
        } else if (data.type === 'shape') {
          element.html(`<svg width="${data.width}" height="${data.height}">
                          <circle cx="50" cy="25" r="20" fill="${data.fill}" />
                        </svg>`);
        }
  
        element.css({
          left: data.x,
          top: data.y,
          width: data.width,
          height: data.height
        });
  
        element.draggable({
          containment: '#playground',
          stop: function(event, ui) {
            data.x = ui.position.left;
            data.y = ui.position.top;
          }
        });
  
        element.click(function(e) {
          e.stopPropagation();
          selectElement(element);
        });
  
        $('#playground').append(element);
      });
  
      alert('Playground state loaded!');
    });
  });
  