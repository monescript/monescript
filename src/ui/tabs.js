function all(root, selector){
  return Array.prototype.slice.call(root.querySelectorAll(selector));
}

function activateTab(link){
  var nav = link.closest('.nav');
  all(nav, '.nav-link').forEach(function(a){
    var active = a === link;
    a.classList.toggle('active', active);
    a.setAttribute('aria-selected', active ? 'true' : 'false');
    var pane = document.querySelector(a.getAttribute('href'));
    if(pane != null){
      pane.classList.toggle('active', active);
      pane.classList.toggle('show', active);
    }
  });
}

function setCollapse(panel, open){
  panel.classList.toggle('show', open);
  all(document, '[data-toggle="collapse"][href="#' + panel.id + '"]').forEach(function(a){
    a.classList.toggle('collapsed', !open);
    a.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function toggleCollapse(link){
  var panel = document.querySelector(link.getAttribute('href'));
  if(panel == null){
    return;
  }
  var open = !panel.classList.contains('show');
  var parent = panel.getAttribute('data-parent');
  if(open && parent != null){
    all(document, parent + ' .collapse.show').forEach(function(other){
      setCollapse(other, false);
    });
  }
  setCollapse(panel, open);
}

module.exports = {
  init: function(){
    document.addEventListener('click', function(e){
      var toggle = e.target.closest('[data-toggle]');
      if(toggle == null){
        return;
      }
      var kind = toggle.getAttribute('data-toggle');
      if(kind === 'tab'){
        e.preventDefault();
        activateTab(toggle);
      } else if(kind === 'collapse'){
        e.preventDefault();
        toggleCollapse(toggle);
      }
    });
  },

  show: function(hash){
    var link = document.querySelector('[data-toggle="tab"][href="' + hash + '"]');
    if(link != null){
      activateTab(link);
    }
  }
};