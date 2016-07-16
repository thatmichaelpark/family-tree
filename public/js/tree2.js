(function() {
  'use strict';

  const canvas = $('#canvas')[0];
  const ctx = canvas.getContext('2d');
  const gridSquareWidth = 120;
  const gridSquareHeight = 150;

  let persons;
  let parentRels;

  // Forward function declarations
  let initData; // eslint-disable-line prefer-const
  let drawTree; // eslint-disable-line prefer-const

  const loadTreePage = function() {
    $.ajax({
      method: 'GET',
      url: '/people'
    })
    .then((data) => {
      persons = data;

      return $.ajax({
        method: 'GET',
        url: '/parents_children'
      });
    })
    .then((data) => {
      parentRels = data;
    })
    .then(() => {
      initData();
      drawTree();
    })
    .catch(() => {
      Materialize.toast('Error loading tree data', 4000);
    });
  };

  loadTreePage();

  let personsById;
  let materix;

  initData = function() {
    personsById = [];
    for (const person of persons) {
      personsById[person.id] = person;
    }

    // init materix
    materix = [];
    for (let i = 0; i < 30; ++i) { // some # > max id
      materix.push([]);
    }

    for (const pr of parentRels) {
      for (const qr of parentRels) {
        if (pr.child_id === qr.child_id) {
          materix[pr.parent_id][qr.parent_id] = true;
          materix[qr.parent_id][pr.parent_id] = true;
        }
      }
    }
  };

  const matesOf = function(id) {
    id = Number(id);
    const res = [];

    for (let j = 0; j < 30; ++j) {
      if (materix[id][j]) {
        res.push(j);
      }
    }

    return res;
  };

  const parentsOf = function(id) {
    id = Number(id);
    const res = [];

    for (const pr of parentRels) {
      if (pr.child_id === id) {
        res.push(pr.parent_id);
      }
    }

    return res;
  };

  const childrenOf = function(id1, id2) {
    id1 = Number(id1);
    id2 = Number(id2);
    const res = [];

    for (const person of persons) {
      const ps = parentsOf(person.id);

      if (ps.indexOf(id1) >= 0 && ps.indexOf(id2) >= 0) {
        res.push(person.id);
      }
    }

    return res;
  };

  let topId;
  let topHeight; // set to 0 before calling findTop *cough* *HACK* *cough*

  const findTop = function(height, id) {
    if (height >= topHeight) {
      topHeight = height;
      topId = id;
    }
    const parents = parentsOf(id);

    for (const parent of parents) {
      findTop(height + 1, parent);
    }

    return topId;
  };

  const descend = function(generation) {
    for (let i = 0; i < generation.length; ++i) {
      const ms = matesOf(generation[i].id);

      switch (ms.length) {
        case 0:
          break;
        case 1:
          generation[i].rightId = null;
          generation[i].children =
            childrenOf(generation[i].id, generation[i].id);
          generation[i].children =
            descend(generation[i].children.map((x) => ({ id: x })));
          break;
        case 2:
          ms.splice(ms.indexOf(generation[i].id), 1);
          generation[i].rightId = ms[0];
          generation[i].children =
            childrenOf(generation[i].id, generation[i].rightId);
          generation[i].children =
            descend(generation[i].children.map((x) => ({ id: x })));
          break;
        case 3:
          ms.splice(ms.indexOf(generation[i].id), 1);
          generation[i].leftId = ms[0];
          generation[i].rightId = ms[1];
          generation[i].leftChildren =
            childrenOf(generation[i].id, generation[i].leftId);
          generation[i].rightChildren =
            childrenOf(generation[i].id, generation[i].rightId);
          generation[i].leftChildren =
            descend(generation[i].leftChildren.map((x) => ({ id: x })));
          generation[i].rightChildren =
            descend(generation[i].rightChildren.map((x) => ({ id: x })));
          break;
        default:
      }
    }

    return generation;
  };

  const computeWidth = function(children) {
    let width = 0;

    for (const child of children) {
      if (child.rightId === undefined) { // no mates => no children
        child.width = 1;
        width += child.width;
      }
      else if (child.leftId === undefined) { // one mate (on right)
        child.width = Math.max(2, computeWidth(child.children));
        width += child.width;
      }
      else {  // two mates
        child.l_width = Math.max(2, computeWidth(child.leftChildren));
        child.r_width = Math.max(2, computeWidth(child.rightChildren));
        width += child.l_width + child.r_width;
      }
    }
    children.width = width;
    return width;
  };

  drawTree = function() {

    const $canvas = $('.tree-div canvas');
    $('.tree-div').empty().append($canvas);

    ctx.clearRect(0, -10, canvas.width, canvas.height); // origin is 10px down

    let selectedPersonId;

    const userId = Number.parseInt(/family-tree-userId=(\d+)/.exec(document.cookie)[1]);
    for (const person of persons) {
      if (person.user_id === userId) {
        selectedPersonId = person.id;
        break;
      }
    }

    topHeight = 0;
    const topId = findTop(0, selectedPersonId);

    const t = [{ id: topId }];
    descend(t);
    computeWidth(t);
    let maxLevel = 0;
    const drawnIds = [];
    drawSubtree(t, (11 - t.width) / 2, 0, undefined, undefined, t.width);

    let x = 0;
    let y = maxLevel + 1;
    for (const p of persons) {
      if (drawnIds.indexOf(p.id) >= 0) {
        continue;
      }
      drawNode(`${p.given_name} ${p.family_name}`, p.id, selectedPersonId, x++, y);
    }


    function drawSubtree(t, left, level, parentx, parenty, parentw) {
      if (level > maxLevel) {
        maxLevel = level;
      }

      let actualw = 0;
      for (const n of t) {
        if (n.rightId === undefined) { // single node
          actualw += 1;
        } else if (n.leftId === undefined) { // double node (one mate)
          actualw += 2;
        } else { // triple node (two mates)
          actualw += (n.l_width + n.r_width) / 2 + 1;
        }
      }
      const offset = (parentw - actualw) / 2;
      for (const n of t) {
        const p = personsById[n.id];
        if (n.rightId === undefined) { // single node
          drawJoin(parentx, parenty, left + offset, level);
          drawNode(p.given_name + ' ' + p.family_name, p.id, selectedPersonId, left + offset, level);
          drawnIds.push(p.id);
          left += n.width;
        } else if (n.leftId === undefined) { // double node (one mate)
          drawJoin(parentx, parenty, left + offset, level);
          drawLine([left+offset, level, left+offset+1, level]);
          drawNode(p.given_name + ' ' + p.family_name, p.id, selectedPersonId, left + offset, level);
          drawnIds.push(p.id);
          const p_r = personsById[n.rightId];
          drawNode(p_r.given_name + ' ' + p_r.family_name, selectedPersonId, p_r.id, left + offset + 1, level);
          drawnIds.push(p_r.id);
          drawSubtree(n.children, left, level + 1, left + offset + 0.5, level, n.width);
          left += n.width;
        } else { // triple node (two mates)
          const p_r = personsById[n.rightId];
          const p_l = personsById[n.leftId];
          const xl = (n.l_width - 1) / 2 + offset;
          const xr = (n.r_width - 1) / 2 + n.l_width + offset;
          const xm = (xl + xr) / 2;
          drawLine([xl - 0.5, level, xr + 0.5, level]);
          drawJoin(parentx, parenty, xm, level);
          drawNode(p.given_name + ' ' + p.family_name, p.id, selectedPersonId, xm, level);
          drawNode(p_r.given_name + ' ' + p_r.family_name, p_r.id, selectedPersonId, xr + 0.5, level);
          drawNode(p_l.given_name + ' ' + p_l.family_name, p_l.id, selectedPersonId, xl - 0.5, level);
          drawnIds.push(p.id);
          drawnIds.push(p.rightId);
          drawnIds.push(p.leftId);
          drawSubtree(n.leftChildren, left + offset, level + 1, xl, level, n.l_width);
          left += n.l_width;
          drawSubtree(n.rightChildren, left + offset, level + 1, xr, level, n.r_width);
          left += n.r_width;
        }
      }
    }
  }

  function drawJoin(parentx, parenty, x, y) {
    if (parentx === undefined) {
      return;
    }
    const midy = (parenty + y) / 2;
    drawLine([parentx, parenty, parentx, midy, x, midy, x, y]);
  }


  canvas.width = 1440;
  canvas.height = 550;
  ctx.translate(0, 10);

  $('.tree-div').on('click', 'a.edit', popUpEditModal);

  function drawNode(name, id, selectedPersonId, x, y) {
    const $node = $(`<div class="node">${name}<a class="edit btn-floating yellow" data-id="${id}"><i class="tiny material-icons">mode_edit</i></a></div>`);
    if (id === selectedPersonId) {
      $node.addClass('selected');
    }
    $('.tree-div').append($node.css({left: (x + 1) * gridSquareWidth - 50, top: (y + 0) * gridSquareHeight - 50}));
  }

  function drawLine(a) {
    ctx.beginPath();
    ctx.strokeStyle = '#fb4d3d';
    ctx.lineWidth = 6;
    ctx.moveTo((a[0] + 1) * gridSquareWidth, (a[1] + 0) * gridSquareHeight);
    a.splice(0, 2);
    while (a.length) {
      ctx.lineTo((a[0] + 1) * gridSquareWidth, (a[1] + 0) * gridSquareHeight);
      a.splice(0, 2);
    }
    ctx.stroke();
    ctx.closePath();
  }
})();
