/* Stickygrid Copyright 2017 Michael Parisi (EVERYTHINGING) */

var ComputeMatrix = function(tv){

  var transformVendor = tv;

  function adj(m) { // Compute the adjugate of m
      return [
          m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
          m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
          m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]
      ];
  }

  var multmmC, multmmI, multmmJ, multmmCIJ, multmmK;
  function multmm(a, b) { // multiply two matrices
      multmmC = Array(9);
      for (multmmI = 0; multmmI != 3; ++multmmI) {
          for (multmmJ = 0; multmmJ != 3; ++multmmJ) {
              multmmCIJ = 0;
              for (multmmK = 0; multmmK != 3; ++multmmK) {
                  multmmCIJ += a[3 * multmmI + multmmK] * b[3 * multmmK + multmmJ];
              }
              multmmC[3 * multmmI + multmmJ] = multmmCIJ;
          }
      }
      return multmmC;
  }

  function multmv(m, v) { // multiply matrix and vector
      return [
          m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
          m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
          m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
      ];
  }

  var pdbgR;
  function pdbg(m, v) {
      pdbgR = multmv(m, v);
      return pdbgR + " (" + pdbgR[0] / pdbgR[2] + ", " + pdbgR[1] / pdbgR[2] + ")";
  }

  var basisToPointsM, basisToPointsV;
  function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
      basisToPointsM = [
          x1, x2, x3,
          y1, y2, y3,
          1, 1, 1
      ];
      basisToPointsV = multmv(adj(basisToPointsM), [x4, y4, 1]);
      return multmm(basisToPointsM, [
          basisToPointsV[0], 0, 0,
          0, basisToPointsV[1], 0,
          0, 0, basisToPointsV[2]
      ]);
  }

  var general2DProjectionS, general2DProjectionD;
  function general2DProjection(x1s, y1s, x1d, y1d, x2s, y2s, x2d, y2d, x3s, y3s, x3d, y3d, x4s, y4s, x4d, y4d) {
      general2DProjectionS = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
      general2DProjectionD = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
      return multmm(general2DProjectionD, adj(general2DProjectionS));
  }

  var projectV;
  function project(m, x, y) {
      projectV = multmv(m, [x, y, 1]);
      return [projectV[0] / projectV[2], projectV[1] / projectV[2]];
  }

  var checkConcaveNumVerticies, checkConcaveV1, checkConcaveV2, checkConcaveDetValue, checkConcaveCurDetValue, checkConcaveI;
  function checkConcave(p) {
    checkConcaveNumVerticies  = 4;
    checkConcaveV1 = calcVector(p[0],p[checkConcaveNumVerticies-1]);
    checkConcaveV2 = calcVector(p[1],p[0]);
    checkConcaveDetValue = calcDeterminant(checkConcaveV1,checkConcaveV2);
    checkConcaveCurDetValue = 0;
    
    for (checkConcaveI = 1 ; checkConcaveI < checkConcaveNumVerticies-1 ; checkConcaveI++) {
      checkConcaveV1 = checkConcaveV2;
      checkConcaveV2 = calcVector(p[checkConcaveI+1],p[checkConcaveI]);
      checkConcaveCurDetValue = calcDeterminant(checkConcaveV1,checkConcaveV2);
      
      if( (checkConcaveCurDetValue * checkConcaveDetValue) < 0.0 ) return false;
    }
      
    checkConcaveV1 = checkConcaveV2;
    checkConcaveV2 = calcVector(p[0],p[checkConcaveNumVerticies-1]);
    checkConcaveCurDetValue = calcDeterminant(checkConcaveV1,checkConcaveV2);
    
    if ((checkConcaveCurDetValue * checkConcaveDetValue) < 0.0) return false;
    else return true;
    
  };

  var calcVectorX, calcVectorY;
  function calcVector(p0, p1) {
    calcVectorX = p0.x - p1.x;
    calcVectorY = p0.y - p1.y;
    return {x: calcVectorX, y: calcVectorY};
  };

  function calcDeterminant(p1, p2) {
    return (p1.x * p2.y - p1.y * p2.x);
  };

  var transform2dW, transform2dH, transform2dT, transform2dI;
  this.transform2d = function(elt, x1, y1, x2, y2, x3, y3, x4, y4, zPos) {
    if (!checkConcave([{x: x1, y: y1}, {x: x2, y: y2}, {x: x4, y: y4}, {x: x3, y: y3}])) return;

    transform2dW = elt.offsetWidth;
    transform2dH = elt.offsetHeight;
    transform2dT = general2DProjection(0, 0, x1, y1, transform2dW, 0, x2, y2, 0, transform2dH, x3, y3, transform2dW, transform2dH, x4, y4);
    for (transform2dI = 0; transform2dI != 9; ++transform2dI) transform2dT[transform2dI] = transform2dT[transform2dI] / transform2dT[8];
    transform2dT = [transform2dT[0], transform2dT[3], 0, transform2dT[6],
        transform2dT[1], transform2dT[4], 0, transform2dT[7],
        0, 0, 1, 0,
        transform2dT[2], transform2dT[5], zPos, transform2dT[8]
    ];
    transform2dT = "matrix3d(" + transform2dT.join(", ") + ")";
    //elt.style["-webkit-transform"] = transform2dT;
    //elt.style["-moz-transform"] = transform2dT;
    //elt.style["-o-transform"] = transform2dT;
    //elt.style.transform = transform2dT;
    elt.style[transformVendor] = transform2dT;
  }

}