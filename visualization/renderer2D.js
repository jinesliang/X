/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

// provides
goog.provide('X.renderer2D');

// requires
goog.require('X.renderer');


/**
 * Create a 2D renderer inside a given DOM Element.
 * 
 * @constructor
 * @param {!Element} container The container (DOM Element) to place the renderer
 *          inside.
 * @extends X.renderer
 */
X.renderer2D = function(container, orientation) {

  //
  // call the standard constructor of X.renderer
  goog.base(this, container);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['className'] = 'renderer2D';
  
  this['orientation'] = orientation;
  
  this.scale = 1;
  
  this.frameBuffer = null;
  this.frameBufferContext
  this.sliceWidth = 0;
  this.sliceHeight = 0;
  
};
// inherit from X.base
goog.inherits(X.renderer2D, X.renderer);


/**
 * @inheritDoc
 */
X.renderer2D.prototype.onScroll_ = function(event) {

  goog.base(this, 'onScroll_', event);
  
  // grab the current volume
  var _volume = this.topLevelObjects[0];
  // .. if there is none, exist right away
  if (!_volume) {
    return;
  }
  
  // switch between different orientations
  var _orientation = this['orientation'];
  var _dimIndex = 0; // for X
  if (_orientation == 'Y') {
    _dimIndex = 1;
  } else if (_orientation == 'Z') {
    _dimIndex = 2;
  }
  
  if (event._up) {
    
    // check if we are in the bounds
    if (_volume['_index' + _orientation] < _volume._dimensions[_dimIndex] - 1) {
      
      // yes, scroll up
      _volume['_index' + _orientation] = _volume['_index' + _orientation] + 1;
      
    }
    
  } else {
    
    // check if we are in the bounds
    if (_volume['_index' + _orientation] > 0) {
      
      // yes, so scroll down
      _volume['_index' + _orientation] = _volume['_index' + _orientation] - 1;
      
    }
    
  }
  
  // .. and trigger re-rendering
  this.render_(false, false);
  
};


/**
 * @inheritDoc
 */
X.renderer2D.prototype.init = function() {

  // call the superclass' init method
  goog.base(this, 'init', '2d');
  
  // background color of the canvas
  this.context.fillStyle = "rgba(0,0,0,0)";
  // .. and size
  this.context.fillRect(0, 0, this['width'], this['height']);
  
  // create an invisible canvas as a framebuffer
  this.frameBuffer = goog.dom.createDom('canvas');
  
};



X.renderer2D.prototype.update_ = function(object) {

  // call the update_ method of the superclass
  goog.base(this, 'update_', object);
  
  // var id = object['_id'];
  // var texture = object._texture;
  var file = object._file;
  
  if (goog.isDefAndNotNull(file) && file._dirty) {
    // this object is based on an external file and it is dirty..
    
    // start loading..
    this.loader.loadFile(object);
    
    return;
    
  }
  // TODO existing check?
  this.objects.add(object);
  
  // check the orientation and store a pointer to the slices
  if (this['orientation'] == 'X') {
    
    this.slices = object._slicesX.children();
    
  } else if (this['orientation'] == 'Y') {
    
    this.slices = object._slicesY.children();
    
  } else if (this['orientation'] == 'Z') {
    
    this.slices = object._slicesZ.children();
    
  }
  
  // to probe the slice dimensions, just grab the first slice
  var _slice = this.slices[0];
  
  var _sliceWidth = _slice._width + 1;
  var _sliceHeight = _slice._height + 1;
  if (this['orientation'] == 'X') {
    
    // the X oriented texture is twisted ..
    var _newSliceWidth = _sliceHeight;
    _sliceHeight = _sliceWidth;
    _sliceWidth = _newSliceWidth;
    
  }
  // .. and store the dimensions
  this.sliceWidth = _sliceWidth;
  this.sliceHeight = _sliceHeight;
  
  // update the invisible canvas to store the current slice
  var _frameBuffer = this.frameBuffer;
  _frameBuffer.width = _sliceWidth;
  _frameBuffer.height = _sliceHeight;
  // .. and the context
  this.frameBufferContext = _frameBuffer.getContext('2d');
  
  // TODO existing check?
  // this.resetView_();
  
};

/**
 * @inheritDoc
 */
// X.renderer2D.prototype.resetViewAndRender = function() {
//
// this.resetView_();
// this.render_(false, false);
//  
// };
X.renderer2D.prototype.resetView_ = function() {

  return;
  console.log('rrrr');
  // ..then the x and y values which are the focus position
  var _view = this['camera']['view'];
  var _focusX = _view.getValueAt(0, 3); // 2 is an acceleration factor
  var _focusY = -1 * _view.getValueAt(1, 3); // we need to flip y here
  console.log(_focusX, _focusY);
  // calculate the optimal scale for the displayed slice
  var _wScale = this['width'] / this.sliceWidth;
  var _hScale = this['height'] / this.sliceHeight;
  
  if (_wScale > _hScale) {
    
    console.log('width', _wScale);
    
    this.scale = _wScale;
    _focusX = (this['width'] / 2 - this.sliceWidth / 2) / this.scale;
    _focusY = 0;
    

  } else {
    
    console.log('height', _hScale);
    
    this.scale = _hScale;
    _focusX = 0;
    _focusY = (this['height'] / 2 - this.sliceHeight / 2) / this.scale;
    

  }
  _view.setValueAt(0, 3, _focusX);
  _view.setValueAt(1, 3, _focusY);
  
  // this.context.translate(this['width'] / 2, this['height'] / 2);
  
};

X.renderer2D.prototype.render_ = function(picking, invoked) {

  // call the update_ method of the superclass
  goog.base(this, 'render_', picking, invoked);
  


  // only proceed if there are actually objects to render
  var _objects = this.objects.values();
  var _numberOfObjects = _objects.length;
  if (_numberOfObjects == 0) {
    // there is nothing to render
    // get outta here
    return;
  }
  
  //
  // grab the camera settings
  //
  
  // viewport size
  var _width = this['width'];
  var _height = this['height'];
  
  // first grab the view matrix which is 4x4 in favor of the 3D renderer
  var _view = this['camera']['view'];
  
  console.log(_view + "");
  
  // ..then the x and y values which are the focus position
  var _focusX = _view.getValueAt(0, 3); // 2 is an acceleration factor
  var _focusY = -1 * _view.getValueAt(1, 3); // we need to flip y here
  
  // ..then the z value which is the zoom level (distance from eye)
  var _scale = _view.getValueAt(2, 3);
  
  // we need to convert the scale from the camera to a binary scale which just
  // indicates the zoom direction
  if (Boolean(_scale)) {
    
    var _zoomFactor = 0.1;
    
    if (_scale < 0 && this.scale > 0.1) {
      
      // we zoom out
      _zoomFactor = -0.1;
      
    }
    
    this.scale = this.scale + _zoomFactor;
    
    // always reset the scale to avoid recursion
    _view.setValueAt(2, 3, 0);
    
  }
  

  //
  // grab the volume and current slice
  //
  var _volume = this.topLevelObjects[0];
  var _currentSlice = _volume['_index' + this['orientation']];
  
  // .. here is the current slice
  var _slice = this.slices[parseInt(_currentSlice, 10)];
  var _sliceData = _slice._texture._rawData;
  var _sliceWidth = this.sliceWidth;
  var _sliceHeight = this.sliceHeight;
  
  //
  // the invincible invisible canvas
  //  
  var _fbContext = this.frameBufferContext;
  
  // grab the current pixels
  var _imageData = _fbContext.getImageData(0, 0, _sliceWidth, _sliceHeight);
  var _pixels = _imageData.data;
  var _pixelsLength = _pixels.length;
  
  // threshold values
  var _maxScalarRange = _volume.scalarRange()[1];
  var _lowerThreshold = _volume['_lowerThreshold'];
  var _upperThreshold = _volume['_upperThreshold'];
  
  // loop through the pixels and draw them to the invisible canvas
  // from bottom right up
  // also apply thresholding
  var _index = 0;
  do {
    
    // default color is just transparent
    var _color = [0, 0, 0, 0];
    
    // grab the pixel intensity
    var _intensity = _sliceData[_index] / 255 * _maxScalarRange;
    
    // apply thresholding
    if (_intensity >= _lowerThreshold && _intensity <= _upperThreshold) {
      
      // current intensity is inside the threshold range so use the real
      // intensity
      _color = [_sliceData[_index], _sliceData[_index + 1],
                _sliceData[_index + 2], _sliceData[_index + 3]];
      
    }
    
    var _invertedIndex = (_pixelsLength - 1 - _index);
    
    _pixels[_invertedIndex - 3] = _color[0]; // r
    _pixels[_invertedIndex - 2] = _color[1]; // g
    _pixels[_invertedIndex - 1] = _color[2]; // b
    _pixels[_invertedIndex] = _color[3]; // a
    
    _index = _index + 4; // increase by rgba unit
    
  } while (_index < _pixelsLength);
  
  // store the generated image data to the invisible canvas context
  _fbContext.putImageData(_imageData, 0, 0);
  

  //
  // the actual drawing (rendering) happens here
  //
  

  if (_scale != 0) {
    // reset the transform of the canvas (including old scales)
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    // propagate the current scale to the canvas
    this.context.scale(this.scale, this.scale);
  }
  
  // clear the canvas
  this.context.clearRect(0, 0, _width, _height);
  
  // draw the invisibleCanvas (which equals the slice data) to the main context
  console.log('fx,fy', _focusX, _focusY);
  this.context.drawImage(this.frameBuffer, _focusX, _focusY);
  console.log('render');
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer2D', X.renderer2D);
goog.exportSymbol('X.renderer2D.prototype.init', X.renderer2D.prototype.init);
goog.exportSymbol('X.renderer2D.prototype.add', X.renderer2D.prototype.add);
goog.exportSymbol('X.renderer2D.prototype.onShowtime',
    X.renderer2D.prototype.onShowtime);
goog.exportSymbol('X.renderer2D.prototype.get', X.renderer2D.prototype.get);
goog.exportSymbol('X.renderer2D.prototype.resetViewAndRender',
    X.renderer2D.prototype.resetViewAndRender);
goog.exportSymbol('X.renderer2D.prototype.render',
    X.renderer2D.prototype.render);
goog.exportSymbol('X.renderer2D.prototype.destroy',
    X.renderer2D.prototype.destroy);
