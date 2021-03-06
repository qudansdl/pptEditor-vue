/**!
 * create by chuchur /chuchur@qq.com
 * 2017年6月10日 22:39:29
 * author：chuchur
 * version:1.0.6
 */

import qdraw from 'qdraw'
let clone = qdraw.util.object.clone
let draw = {}
const getRandomInt = (min, max) => { return Math.floor(Math.random() * (max - min + 1)) + min }
const pad = (str, length) => { while (str.length < length) { str = '0' + str }; return str }
const getRandomColor = () => { return (pad(getRandomInt(0, 255).toString(16), 2) + pad(getRandomInt(0, 255).toString(16), 2) + pad(getRandomInt(0, 255).toString(16), 2)) }
const getRandomLeftTop = () => { var offset = 50; return { left: qdraw.util.getRandomInt(0 + offset, 700 - offset), top: qdraw.util.getRandomInt(0 + offset, 500 - offset) } }
const capitalize = (string) => { return string.charAt(0).toUpperCase() + string.slice(1) }
const getRandomNum = (min, max) => { return Math.random() * (max - min) + min }
let canvas = null

draw.init = (_canvas,callback) => {
  canvas = _canvas
  const render = () => { canvas.renderAll(); }
  canvas.on('object:selected', callback).on('selection:cleared', callback).on('group:selected', callback).on('path:created', callback)

  let box = canvas.wrapperEl //upperCanvasEl
  box.setAttribute('tabindex', 1)
  box.addEventListener('blur', ()=> { setTimeout(() => { document.oncopy = null; document.onpaste = null; document.oncut = null; }, 300); }, false)

  box.onkeydown = draw.keydown;

  box.onfocus = ()=> { document.oncopy = draw.copy; document.onpaste = draw.paste; document.oncut = (e) => draw.copy(e, true); }

  let ismouseDown = false;
  let obj = null,linkObj=null;
  let sp = { x: 0, y: 0 }
  // canvas.drawMode=true
  const down = (ev) => {
    obj = null,linkObj=null;
    if (!canvas.drawMode) { if (canvas.drawMode != 'link' && (canvas.getActiveObject() || canvas.getActiveGroup())) return; }
    ismouseDown = true;
    sp = { x: ev.e.layerX, y: ev.e.layerY }
    switch (canvas.drawMode) {
      case 'line': obj = draw.addLine([sp.x, sp.y, sp.x, sp.y]); break;
      case 'rect': obj = draw.addRect({ left: sp.x, top: sp.y, width: 1, height: 1, fill: '#fff', setroke: 'red' }); break;
      case 'circle': obj = draw.addCircle({ left: sp.x, top: sp.y, radius: 1, fill: '#fff', stroke: 'red' }); break;
      case 'triangle': obj = draw.addTriangle({ left: sp.x, top: sp.y, width: 1, height: 1, fill: '#fff', stroke: 'red' }); break;
      case 'link': if (canvas.getActiveObject() && !canvas.getActiveObject().x2) { let o = linkObj = canvas.getActiveObject(); o.set({ lockMovementX: true, lockMovementY: true }); sp = { x: o.left + (o.width * o.zoomX / 2), y: o.top + (o.height * o.zoomY / 2) }; obj = draw.addLine([sp.x, sp.y, sp.x, sp.y], false); o.link1 ? o.link1.push(obj) : (o.link1 = [obj]); } break;
    }
  }
  const move = (ev) => {    
    if (canvas.drawMode && ismouseDown&&obj) {
      switch (canvas.drawMode) {
        case 'link':
        case 'line': obj.set({ x2: ev.e.layerX, y2: ev.e.layerY }); break;
        case 'rect': obj.set({ width: ev.e.layerX - sp.x, height: ev.e.layerY - sp.y }); break;
        case 'circle': obj.set({ radius: (ev.e.layerX - sp.x) / 2 }); break;
        case 'triangle': obj.set({ width: ev.e.layerX - sp.x, height: ev.e.layerY - sp.y }); break;
      }
      obj.setCoords(); canvas.renderAll();
    }
  }
  const up = (e) => { if (!ismouseDown || !obj) return; ismouseDown = false; if (canvas.drawMode == 'link') { linkObj && linkObj.set({ lockMovementX: false, lockMovementY: false }); let o = getObjectByPoint(e.e.layerX, e.e.layerY); if (!o) { canvas.remove(obj); return; } else { obj.set({ x2: o.left + (o.width * o.zoomX / 2), y2: o.top + (o.height * o.zoomY / 2) }); o.link2 ? o.link2.push(obj) : (o.link2 = [obj]); } canvas.sendToBack(obj); return; } obj.active = true; (e.e.layerX == sp.x && e.e.layerY == sp.y) && canvas.remove(obj); }
  const objMove = (ev) => { let o = ev.target; if (o.link1 && o.link1.length > 0) { o.link1.map(x => x.set({ x1: o.left + (o.width * o.zoomX / 2), y1: o.top + (o.height * o.zoomY / 2) })) } if (o.link2 && o.link2.length > 0) { o.link2.map(x => x.set({ x2: o.left + (o.width * o.zoomX / 2), y2: o.top + (o.height * o.zoomY / 2) })) } }
  canvas.on('mouse:down', (ev) => down(ev)).on('mouse:move', (ev) => move(ev)).on('mouse:up', (ev) => up(ev)).on('object:moving', (ev) => objMove(ev)).on('object:modified',(ev)=>objMove(ev))
}
const getObjectByPoint = (x, y) => {
  let items = canvas.getObjects();
  let objs = [];
  items && items.map((o) => {
    if (!o.x2&&!o.y2 && o.left < x && o.top < y && (o.left + o.width * o.zoomX) > x && (o.top + o.height * o.zoomY) > y) objs.push(o)
  })
  return objs.length == 1 ? objs[0] : null;
}
draw.render = () => { canvas.renderAll() }
// 组件属性设置

const getActiveProp = (name) => { if (!canvas) return ''; var object = canvas.getActiveObject(); if (!object) return ''; return object[name] || ''; }
const setActiveProp = (name, value) => { if (!canvas) return ''; var object = canvas.getActiveObject(); if (!object) return; object.set(name, value).setCoords(); canvas.renderAll(); }
const getActiveStyle = (styleName, object) => { if (!canvas) return ''; object = object || canvas.getActiveObject(); if (!object) return ''; return (object.getSelectionStyles && object.isEditing) ? (object.getSelectionStyles()[styleName] || '') : (object[styleName] || '') }
const setActiveStyle = (styleName, value, object) => { if (!canvas) return ''; object = object || canvas.getActiveObject(); if (!object) return; if (object.setSelectionStyles && object.isEditing) { var style = {}; style[styleName] = value; object.setSelectionStyles(style); object.setCoords(); } else { object.set(styleName, value) } object.setCoords(); canvas.renderAll(); }

draw.setActiveStyle = setActiveStyle;  draw.getActiveStyle = getActiveStyle;  draw.getActiveProp = getActiveProp;  draw.setActiveProp = setActiveProp;
draw.getOpacity = () => { return getActiveStyle('opacity'); }
draw.setOpacity = (value) => { setActiveStyle('opacity', parseFloat(value, 10)); }
draw.getFill = () => { return getActiveStyle('fill') }
draw.setFill = (value) => { setActiveStyle('fill', value) }
draw.isBold = () => { return getActiveStyle('fontWeight') === 'bold' }
draw.toggleBold = () => { setActiveStyle('fontWeight', getActiveStyle('fontWeight') === 'bold' ? '' : 'bold') }
draw.isItalic = () => { return getActiveStyle('fontStyle') === 'italic' }
draw.toggleItalic = () => { setActiveStyle('fontStyle', getActiveStyle('fontStyle') === 'italic' ? '' : 'italic') }
draw.toggleFlipX = () => { setActiveProp('flipX', !canvas.getActiveObject().flipX) }
draw.toggleFlipY = () => { setActiveProp('flipY', !canvas.getActiveObject().flipY) }
draw.isUnderline = () => { return getActiveStyle('textDecoration').indexOf('underline') > -1 }
draw.toggleUnderline = () => { var value = draw.isUnderline() ? getActiveStyle('textDecoration').replace('underline', '') : (getActiveStyle('textDecoration') + ' underline'); setActiveStyle('textDecoration', value) }
draw.isLinethrough = () => { return getActiveStyle('textDecoration').indexOf('line-through') > -1 }
draw.toggleLinethrough = () => { var value = draw.isLinethrough() ? getActiveStyle('textDecoration').replace('line-through', '') : (getActiveStyle('textDecoration') + ' line-through'); setActiveStyle('textDecoration', value) }
draw.isOverline = () => { return getActiveStyle('textDecoration').indexOf('overline') > -1 }
draw.toggleOverline = () => { var value = draw.isOverline() ? getActiveStyle('textDecoration').replace('overline', '') : (getActiveStyle('textDecoration') + ' overline'); setActiveStyle('textDecoration', value) }
draw.setLeft = (value) => { return setActiveProp('left', value - 0) }
draw.setTop = (value) => { return setActiveProp('top', value - 0) }
draw.getLeft = () => { return getActiveProp('left') }
draw.getTop = () => { return getActiveProp('top') }
draw.getText = () => { return getActiveProp('text') }
draw.setText = (value) => { setActiveProp('text', value) }
draw.getTextAlign = () => { return capitalize(getActiveProp('textAlign')) }
draw.setTextAlign = (value) => { setActiveProp('textAlign', value.toLowerCase()) }
draw.getFontFamily = () => { return getActiveProp('fontFamily').toLowerCase() }
draw.setFontFamily = (value) => { setActiveProp('fontFamily', value.toLowerCase()) }
draw.getBgColor = () => { return getActiveProp('backgroundColor') }
draw.setBgColor = (value) => { setActiveProp('backgroundColor', value) }
draw.getTextBgColor = () => { return getActiveProp('textBackgroundColor') }
draw.setTextBgColor = (value) => { setActiveProp('textBackgroundColor', value) }
draw.getStroke = () => { return getActiveStyle('stroke') }
draw.setStroke = (value) => { setActiveStyle('stroke', value) }
draw.getStrokeWidth = () => { return parseInt(getActiveStyle('strokeWidth')) }
draw.setStrokeWidth = (value) => { setActiveStyle('strokeWidth', parseInt(value, 10)) }
draw.getFontSize = () => { return getActiveStyle('fontSize') }
draw.setFontSize = (value) => { setActiveStyle('fontSize', parseInt(value, 10)) }
draw.getLineHeight = () => { return getActiveStyle('lineHeight') }
draw.setLineHeight = (value) => { setActiveStyle('lineHeight', parseFloat(value, 10)) }
draw.getCharSpacing = () => { return getActiveStyle('charSpacing') }
draw.setCharSpacing = (value) => { setActiveStyle('charSpacing', value) }
draw.getBold = () => { return getActiveStyle('fontWeight') }
draw.setBold = (value) => { setActiveStyle('fontWeight', value ? 'bold' : '') }
draw.getCanvasBgColor = () => { return canvas.backgroundColor }
draw.setCanvasBgColor = (value) => { canvas.backgroundColor = value; canvas.renderAll() }
draw.togglePlay = () => { let o = canvas.getActiveObject(); if (!o || !o.getElement) return; let v = o.getElement(); v.paused ? v.play() : v.pause(); }
draw.createVideo = (url) => { let v = document.createElement('video'); v.src = url; v.width = 640; v.height = 360; var video = new qdraw.Image(v, { left: 150, top: 150, originX: 'center', originY: 'center' }); canvas.add(video); video.getElement().play(); qdraw.util.requestAnimFrame(function render() { canvas.renderAll(); qdraw.util.requestAnimFrame(render); }); }
draw.createSVG = (o) => { let d = o.d || o.path; let stroke = o.stroke || '#000000 '; let strokeWidth = o.strokeWidth || 1; let width = o.width || 100; let height = o.height || 100; let angle = o.angle || 0; let svg = ''; if (d) { svg = `<svg xmlns="http://www.w3.org/2000/svg" ><svg><path fill="${!o.d ? 'none' : o.fill}" transform="scale(${o.zoomX} ${o.zoomY}) translate(${o.skewX} ${o.skewY}) rotate(${angle})" stroke="${stroke}" stroke-width="${strokeWidth}" d="${d}"></path></svg></svg>`; draw.loadSVGWithoutGrouping(svg) } return svg }


// 画图相关

draw.addRect = (options) => { if (typeof options != 'object') return; let obj = new qdraw.Rect(options); canvas.add(obj); return obj; }
draw.addCircle = (options) => { if (typeof options != 'object') return; let obj = new qdraw.Circle(options); canvas.add(obj); return obj; }
draw.addTriangle = (options)=> { if (typeof options != 'object') return; let obj = new qdraw.Triangle(options); canvas.add(obj); return obj; }
draw.addLine = (ops,s=true) => { let line = new qdraw.Line([ops[0], ops[1], ops[2], ops[3]], { fill: 'red', stroke: 'red', strokeWidth: 2,selectable:s }); canvas.add(line); return line; }
draw.addPolygon = () => { var coord = getRandomLeftTop(); this.canvas.add(new qdraw.Polygon([{ x: 185, y: 0 }, { x: 250, y: 100 }, { x: 385, y: 170 }, { x: 0, y: 245 }], { left: coord.left, top: coord.top, fill: '#' + getRandomColor() })) }
draw.addText = (options) => { options.originX = 'left'; options.hasRotatingPoint = true; options.centerTransform = true; options.hasRotatingPoint = true; options.centerTransform = true; options.fontFamily = '微软雅黑'; options.fontWeight = options.fontWeight || ''; options.width = options.text.length * 16 > 600 ? 600 : options.text.length * 16; let text = new qdraw.Text(options.text, options); let c = ['ml', 'mr', 'mt', 'mb']; c.map((x) => { text['setControlVisible'](x, false) }); canvas.add(text); }
draw.addTextbox = (options) => { options.originX = 'left'; options.hasRotatingPoint = true; options.centerTransform = true; options.fontFamily = '微软雅黑'; options.fontWeight = options.fontWeight || ''; options.width = options.text.length * 16 > 600 ? 600 : options.text.length * 16; let text = new qdraw.Textbox(options.text, options); canvas.add(text); }
draw.addIText = (options) => { options.originX = 'left'; options.hasRotatingPoint = true; options.centerTransform = true; options.hasRotatingPoint = true; options.centerTransform = true; options.fontFamily = '微软雅黑'; options.fontWeight = options.fontWeight || ''; options.width = options.text.length * 16 > 600 ? 600 : options.text.length * 16; let text = new qdraw.IText(options.text, options); let c = ['ml', 'mr', 'mt', 'mb']; c.map((x) => { text['setControlVisible'](x, false) }); canvas.add(text); }
draw.addShapeByUrl = (svgUrl)=> {    var coord = getRandomLeftTop();    qdraw.loadSVGFromURL(svgUrl,  (objects, options)=> {      var loadedObject = qdraw.util.groupSVGElements(objects, options);      loadedObject.set({ left: 100, top: 100, angle: 0, }).setCoords();      canvas.add(loadedObject);    })  }
draw.addImage = (o) => { qdraw.Image.fromURL(o.src, (image)=> { image.set(o).scale(o.zoomX || .15, o.zoomY || .15).setCoords(); canvas.add(image) }) }


// 画布执行型操作

draw.confirmClear = () => { if (confirm('清空不能复原，您确定吗?')) { canvas.clear(); } }
draw.toImage = () => { if (!qdraw.Canvas.supports('toDataURL')) { alert('您的浏览器不支持此项操作！') } else { return canvas.toDataURL('jpeg') } }
draw.toSVG = () => { window.open('data:image/svg+xmlutf8,' + encodeURIComponent(canvas.toSVG())) }
draw.toJSON = () => { draw.setConsoleJSON(JSON.stringify(canvas)) }
draw.getSelected = () => { if (!canvas) return ''; return canvas.getActiveObject() }
draw.getSelectedGroup = () => { if (!canvas) return ''; return canvas.getActiveGroup() }
draw.removeSelected = () => { var obj = canvas.getActiveObject(); var objs = canvas.getActiveGroup(); if (objs) { var objectsInGroup = objs.getObjects(); canvas.discardActiveGroup(); objectsInGroup.forEach((object) => { if (object.getElement) { object._element = null } canvas.remove(object) }); } else if (obj) { if (obj.link1 && obj.link1.length > 0) obj.link1.map(x => canvas.remove(x)); if (obj.link2 && obj.link2.length > 0) obj.link2.map(x => canvas.remove(x)); if (obj.getElement) { obj._element = null } canvas.remove(obj) } }

// 锁定

draw.toggleLock = () => { let value = !getActiveProp('lockRotation'); setActiveProp('lockMovementX', value); setActiveProp('lockMovementY', value); setActiveProp('lockScalingX', value); setActiveProp('lockScalingY', value); setActiveProp('lockRotation', value); }
draw.getHorizontalLock = () => { return getActiveProp('lockMovementX') }
draw.setHorizontalLock = (value) => { setActiveProp('lockMovementX', value) }
draw.getVerticalLock = () => { return getActiveProp('lockMovementY') }
draw.setVerticalLock = (value) => { setActiveProp('lockMovementY', value) }
draw.getScaleLockX = () => { return getActiveProp('lockScalingX') }
draw.setScaleLockX = (value) => { setActiveProp('lockScalingX', value) }
draw.getScaleLockY = () => { return getActiveProp('lockScalingY') }
draw.setScaleLockY = (value) => { setActiveProp('lockScalingY', value) }
draw.getRotationLock = () => { return getActiveProp('lockRotation') }
draw.setRotationLock = (value) => { setActiveProp('lockRotation', value) }


// 其他相关属性 ，对齐

draw.getOriginX = () => { return getActiveProp('originX') }
draw.setOriginX = (value) => { setActiveProp('originX', value) }
draw.getOriginY = () => { return getActiveProp('originY') }
draw.setOriginY = (value) => { setActiveProp('originY', value) }
draw.getObjectCaching = () => { return getActiveProp('objectCaching') }
draw.setObjectCaching = (value) => { return setActiveProp('objectCaching', value) }
draw.getNoScaleCache = () => { return getActiveProp('noScaleCache') }
draw.setNoScaleCache = (value) => { return setActiveProp('noScaleCache', value) }
draw.getTransparentCorners = () => { return getActiveProp('transparentCorners') }
draw.setTransparentCorners = (value) => { return setActiveProp('transparentCorners', value) }
draw.getHasBorders = () => { return getActiveProp('hasBorders') }
draw.setHasBorders = (value) => { return setActiveProp('hasBorders', value) }
draw.getHasControls = () => { return getActiveProp('hasControls') }
draw.setHasControls = (value) => { return setActiveProp('hasControls', value) }


// 层级切换

draw.sendBackwards = () => { var activeObject = canvas.getActiveObject(); if (activeObject) { canvas.sendBackwards(activeObject) } }
draw.sendToBack = () => { var activeObject = canvas.getActiveObject(); if (activeObject) { canvas.sendToBack(activeObject) } }
draw.bringForward = () => { var activeObject = canvas.getActiveObject(); if (activeObject) { canvas.bringForward(activeObject) } }
draw.bringToFront = () => { var activeObject = canvas.getActiveObject(); if (activeObject) { canvas.bringToFront(activeObject) } }

// 裁剪，阴影

draw.clip = () => { var obj = canvas.getActiveObject(); if (!obj) return; if (obj.clipTo) { obj.clipTo = null } else { var radius = obj.width < obj.height ? (obj.width / 2) : (obj.height / 2); obj.clipTo = function (ctx) { ctx.arc(0, 0, radius, 0, Math.PI * 2, true) } } canvas.renderAll() }
draw.shadowify = () => { var obj = canvas.getActiveObject(); if (!obj) return; if (obj.shadow) { obj.shadow = null } else { obj.setShadow({ color: 'rgba(0,0,0,0.3)', blur: 10, offsetX: 10, offsetY: 10 }) } canvas.renderAll() }
draw.gradientify = () => { var obj = canvas.getActiveObject(); if (!obj) return; obj.setGradient('fill', { x1: 0, y1: 0, x2: (getRandomInt(0, 1) ? 0 : obj.width), y2: (getRandomInt(0, 1) ? 0 : obj.height), colorStops: { 0: '#' + getRandomColor(), 1: '#' + getRandomColor() } }); canvas.renderAll() }


// 外部执行
let consoleJSONValue = '';let consoleSVGValue = '';let consoleValue = '';draw.consoleJSONValue = consoleJSONValue;draw.consoleSVGValue = consoleSVGValue;draw.consoleValue = consoleValue;

draw.isFullScreen = () => {return document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled||false;}//return document.fullscreenElement || document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || false;}
draw.elementFullScreen = (element) => { if (element.requestFullscreen) { element.requestFullscreen(); } else if (element.mozRequestFullScreen) { element.mozRequestFullScreen(); } else if (element.webkitRequestFullscreen) { element.webkitRequestFullscreen(); } else if (element.msRequestFullscreen) { element.msRequestFullscreen(); } }
draw.resize = (w, h, p = false) => { draw.draws.map((c) => { c.isPreview = p; let cWidth = c.width; let cHeight = c.height; let ratio = cWidth / cHeight; let newHeight = h; let newWidth = h * ratio; c.setDimensions({ height: newHeight, width: newWidth }); let zoomRatio = newWidth / cWidth; c.zoomToPoint({ x: newHeight / 2, y: newWidth / 2 }, zoomRatio); c.viewportTransform[4] = 0; c.viewportTransform[5] = 0; }) }
draw.toggleFullScreen = (box) => { box = box || document.getElementsByClassName('pages')[0]; if (draw.isFullScreen()) { let w = window.screen.width; let h = window.screen.height; box.style.background = '#000'; box.style.overflow = 'hidden'; box.style.padding = '0'; box.style.margin = '0'; draw.resize(w, h, true); } else { box.style = ''; draw.draws.map((c) => { c.isPreview = false; c.setDimensions({ height: draw.height, width: draw.width }); c.zoomToPoint({ x: draw.width / 2, y: draw.height / 2 }, 1); }) } draw.render() }
draw.screenChange = () => { let doc = document; doc.addEventListener('fullscreenchange', (e) => { draw.toggleFullScreen() }, false); doc.addEventListener('msfullscreenchange', (e) => { draw.toggleFullScreen() }, false); doc.addEventListener('mozfullscreenchange', (e) => { draw.toggleFullScreen() }, false); doc.addEventListener('webkitfullscreenchange', (e) => { draw.toggleFullScreen() }, false); } 
draw.ondrop = (e) => { e.preventDefault(); var fs = e.dataTransfer.files; for (var i = 0; i < fs.length; i++) { if (fs[i].type.indexOf('image') != -1) { var reader = new FileReader(); reader.onload = (y) => { let o = { src: y.target.result, zoomX: 1, zoomY: 1 }; draw.addImage(o); }; reader.readAsDataURL(fs[i]); } } }
draw.keydown = (e) => { let key = e.keyCode; if (key == 46 || key == 8) { draw.removeSelected(); return false; } if (e.ctrlKey) { if (e.shiftKey) { if (key == 38) { draw.bringToFront() }; if (key == 40) { draw.sendToBack() }; return; } if (key == 38) { draw.bringForward() }; if (key == 40) { draw.sendBackwards() }; if (key == 76) { draw.toggleLock() }; return; } let obj = draw.getSelected(); if (!obj) return; if (key == 37) { let x = obj.left - 10; draw.setLeft(x) }; if (key == 38) { let y = obj.top - 10; draw.setTop(y) }; if (key == 39) { let x = obj.left + 10; draw.setLeft(x) }; if (key == 40) { let y = obj.top + 10; draw.setTop(y) }; }
draw.copyData = null
draw.copy = (e, cut) => { e.preventDefault(); let board = e.clipboardData || window.clipboardData; let gs = canvas.getActiveGroup(); let o = canvas.getActiveObject(); if (!gs && !o) return; let obj = gs ? [gs] : [o]; let str = JSON.stringify(obj); board.setData('text', str); cut && draw.removeSelected(); draw.copyData = str; return str; }
draw.paste = (e) => { e.preventDefault(); let board = e.clipboardData; var i = 0, items, item, types; items = board.items; if (!items) { return } item = items[0]; types = board.types || []; for (; i < types.length; i++) { if (types[i] === 'Files') { item = items[i]; break; } } if (item && item.kind === 'file' && item.type.match(/^image\//i)) { var file = item.getAsFile(), reader = new FileReader(); reader.onload = (e) => { let o = { src: e.target.result, zoomX: 1, zoomY: 1 }; draw.addImage(o) }; reader.readAsDataURL(file); return } let data = board.getData('text'); if (data.indexOf('[{"type":') == 0) { let obj = JSON.parse(data); let o = obj[0].type == 'group' ? obj[0].objects : obj; if (o.length > 1) { let _o = obj[0]; o.map((x) => { x.left = _o.left + x.left + _o.width / 2, x.top = _o.top + x.top + _o.height / 2 }) }; canvas.loadObjFormJson(o); } else { draw.addIText({ text: data, fontSize: 14, left: 20, top: 20 }) } }
draw.group = () => { let x = canvas.getActiveGroup(); if (!x || !x.getObjects) return; let y = x.getObjects(); let groups = []; y.map((x) => { groups.push(clone(x)) }); let opt = { left: x.left, top: x.top, angle: x.angle, scaleX: x.scaleX, scaleY: x.scaleY }; let group = new qdraw.Group(groups, opt); group.isGroup = true; canvas.add(group); draw.removeSelected(); draw.render(); }
draw.ungroup = () => { let o = canvas.getActiveObject(); if (!o || !o.getObjects) return; let data = JSON.parse(JSON.stringify(o.getObjects())); data.map((x) => { x.skewX *= o.skewX, x.skewY *= o.skewY, x.flipX = x.flipX && o.flipX ? false : x.flipX || o.flipX, x.flipY = x.flipY && o.flipY ? false : x.flipY || o.flipY, x.angle += o.angle, x.zoomX *= o.zoomX, x.zoomY *= o.zoomY, x.scaleX *= o.scaleX, x.scaleY *= o.scaleY, x.left += o.left + o.width / 2, x.top += o.top + o.height / 2 }); canvas.loadObjFormJson(data); draw.removeSelected(); return; }
draw.cancelSelect = () => { let obj = canvas.getActiveObject(); let group = canvas.getActiveGroup(); obj && (obj.active = false, obj.setCoords()); group && (group.active = false, group.setCoords()); if (group) { var o = group.getObjects(); let arr = []; o.forEach(function (object) { object.active = false }) } canvas.renderAll() }
draw.getConsoleJSON = () => { return consoleJSONValue }
draw.setConsoleJSON = (value) => { consoleJSONValue = value }
draw.getConsoleSVG = () => { return consoleSVGValue }
draw.setConsoleSVG = (value) => { consoleSVGValue = value }
draw.getConsole = () => { return consoleValue }
draw.setConsole = (value) => { consoleValue = value }
draw.loadSVGWithoutGrouping = (svg) => { qdraw.loadSVGFromString(svg, (objects) => { canvas.add.apply(canvas, objects); canvas.renderAll(); }) }
draw.loadSVG = (svgStr, options) => { _loadSVG(svgStr, options) }
var _loadSVG = (svg, opts) => { qdraw.loadSVGFromString(svg, (objects, options) => { var obj = qdraw.util.groupSVGElements(objects, options); if (typeof opts === 'object') { Object.keys(opts).map(x => obj[x] = opts[x]) } canvas.add(obj).centerObject(obj).renderAll(); obj.setCoords(); }) }
draw.saveJSON = () => { _saveJSON(JSON.stringify(canvas)) }
var _saveJSON = (json) => { draw.setConsoleJSON(json) }
draw.loadJSON = () => { _loadJSON(consoleJSONValue) }
var _loadJSON = (json) => { canvas.loadFromJSON(json, () => { canvas.renderAll() }) }

//数据输出部分

// 绘图模式
draw.drawMode = (mode) => { canvas['drawMode'] = mode; canvas.selection = !mode; }
draw.isDrawingMode = () => { return canvas.isDrawingMode }
draw.getPreserveObjectStacking = () => { return canvas.preserveObjectStacking }
draw.setPreserveObjectStacking = (value) => { return canvas.preserveObjectStacking = value }
draw.getFreeDrawingMode = () => { return canvas.isDrawingMode }
draw.setFreeDrawingMode = (value) => { canvas.isDrawingMode = !!value }
draw.freeDrawingMode = 'Pencil'
draw.getDrawingMode = () => { return draw.freeDrawingMode }
draw.setDrawingMode = (type) => { draw.freeDrawingMode = type; if (type === 'hline') { canvas.freeDrawingBrush = draw.vLinePatternBrush } else if (type === 'vline') { canvas.freeDrawingBrush = draw.hLinePatternBrush } else if (type === 'square') { canvas.freeDrawingBrush = draw.squarePatternBrush } else if (type === 'diamond') { canvas.freeDrawingBrush = draw.diamondPatternBrush } else if (type === 'texture') { canvas.freeDrawingBrush = draw.texturePatternBrush } else { canvas.freeDrawingBrush = new qdraw[type + 'Brush'](canvas) } }
draw.getDrawingLineWidth = () => { if (canvas.freeDrawingBrush) { return canvas.freeDrawingBrush.width } }
draw.setDrawingLineWidth = (value) => { if (canvas.freeDrawingBrush) { canvas.freeDrawingBrush.width = parseInt(value, 10) || 1 } }
draw.getDrawingLineColor = () => { if (canvas.freeDrawingBrush) { return canvas.freeDrawingBrush.color } }
draw.setDrawingLineColor = (value) => { if (canvas.freeDrawingBrush) { canvas.freeDrawingBrush.color = value } }
draw.getDrawingLineShadowWidth = () => { if (canvas.freeDrawingBrush && canvas.freeDrawingBrush.shadow) { return canvas.freeDrawingBrush.shadow.blur || 1 } else { return 0 } }
draw.setDrawingLineShadowWidth = (value) => { if (canvas.freeDrawingBrush) { var blur = parseInt(value, 10) || 1; if (blur > 0) { canvas.freeDrawingBrush.shadow = new qdraw.Shadow({ blur: blur, offsetX: 10, offsetY: 10 }) } else { canvas.freeDrawingBrush.shadow = null } } }
// 初始化
(() => { if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) { qdraw.Object.prototype.cornerSize = 30 } })()
draw.getDPI = () => { var arrDPI = []; if (window.screen.deviceXDPI !== undefined) { arrDPI[0] = window.screen.deviceXDPI; arrDPI[1] = window.screen.deviceYDPI; } else { var tmpNode = document.createElement('DIV'); tmpNode.style.cssText = 'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden'; document.body.appendChild(tmpNode); arrDPI[0] = parseInt(tmpNode.offsetWidth); arrDPI[1] = parseInt(tmpNode.offsetHeight); tmpNode.parentNode.removeChild(tmpNode); } return arrDPI; }
export default draw