class NodeSensor {
    constructor(originNode, maxNodeCount, extendedRadiusFactor = 1.1) {
        this.originNode = originNode;
        this.maxNodeCount = maxNodeCount;

        this.searchRadius = 1;

        this.sensorDataCanvas = Elem.byId('sensorData');

        this.nearbyNodes = [];

        this.extendedRadiusFactor = extendedRadiusFactor;
        this.nodesWithinExtendedRadius = [];

        this.extendedSearchPosition = null;
        this.extendedSearchRadius = null;
        this.farthestNodeInfo = null;  // Storing the farthest node info
    }

    // Method to calculate the distance considering scale as a proportional factor
    getDistance(node) {
        const dx = this.originNode.pos.x - node.pos.x;
        const dy = this.originNode.pos.y - node.pos.y;
        let ds = this.originNode.scale - node.scale; // Difference in scale

        // Bias factor for larger nodes
        const largerNodeBiasFactor = 0.03; // Reduce the scale difference for larger nodes by this factor

        // If the target node is larger, apply the bias factor to reduce the scale difference
        if (node.scale > this.originNode.scale) {
            ds *= largerNodeBiasFactor;
        }

        // Factor to determine the influence of scale in the distance calculation
        const scaleInfluenceFactor = 1; // Adjust this value based on desired influence

        // Calculate a '3D' distance considering x, y, and the adjusted scale (ds)
        return Math.sqrt(dx * dx + dy * dy + (ds * ds * scaleInfluenceFactor));
    }

    static isNodeWithinThis(node){
        return node.uuid !== this.sensor.originNode.uuid
            && this.sensor.getDistance(node) <= this.radius
    }
    findNearbyNodes(radius){
        const ct = {radius, sensor: this};
        return App.processedNodes.filter(NodeSensor.isNodeWithinThis, ct);
    }

    update() {
        App.processedNodes.update();
        this.nearbyNodes = [];

        // Determine if total nodes are fewer than maxNodeCount
        if (Object.keys(Graph.nodes).length <= this.maxNodeCount) {
            this.nearbyNodes = this.findNearbyNodes(Infinity);
        } else {
            let searchComplete = false;
            while (!searchComplete) {
                const potentialNearbyNodes = this.findNearbyNodes(this.searchRadius);

                if (potentialNearbyNodes.length >= this.maxNodeCount) {
                    this.nearbyNodes = potentialNearbyNodes
                        .sort((a, b) => this.getDistance(a) - this.getDistance(b))
                        .slice(0, this.maxNodeCount);

                    searchComplete = true;
                } else {
                    this.searchRadius += 1;
                }
            }
        }

        this.farthestNodeInfo = this.findFarthestNodePosition();

        this.farthestNodeInfo = this.findFarthestNodePosition();

        if (this.farthestNodeInfo) {
            const vectorToFarthestNode = this.farthestNodeInfo.position.minus(this.originNode.pos);
            const normalizedVector = vectorToFarthestNode.normed();
            const extendedVector = normalizedVector.scale(this.extendedRadiusFactor * this.originNode.scale);
            this.extendedSearchPosition = this.farthestNodeInfo.position.plus(extendedVector);

            this.extendedSearchRadius = this.getDistance({
                pos: this.extendedSearchPosition,
                scale: this.originNode.scale
            });

            // Filter out nodes already in nearbyNodes
            this.nodesWithinExtendedRadius = this.findNearbyNodes(this.extendedSearchRadius)
                .filter(node => !this.nearbyNodes.some(nearbyNode => nearbyNode.uuid === node.uuid));
        }
    }

    callUpdate() {
        this.update();
        //this.clearSensorDrawings();
        //this.drawDetections();

        // Draw the standard search area using the farthest node info
        //if (this.farthestNodeInfo) {
        //    const standardSearchArea = new SearchArea(this.originNode, this.farthestNodeInfo.position, this.farthestNodeInfo.scale);
        //    standardSearchArea.draw(this.sensorDataCanvas);
        //}

        // Draw the extended search area
        //if (this.extendedSearchPosition && this.extendedSearchRadius) {
        //    const extendedSearchArea = new SearchArea(this.originNode, this.extendedSearchPosition, this.farthestNodeInfo.scale, { stroke: 'blue', fill: 'none' });
        //    extendedSearchArea.draw(this.sensorDataCanvas);
        //}
    }

    findFarthestNodePosition() {
        let farthestNode = null;
        let maxDistance = 0;
        this.nearbyNodes.forEach(node => {
            const distance = this.getDistance(node);
            if (distance > maxDistance) {
                maxDistance = distance;
                farthestNode = node;
            }
        });
        return farthestNode ? { position: farthestNode.pos, scale: farthestNode.scale } : null;
    }

    drawSearchArea(farthestNodeInfo) {
        if (!farthestNodeInfo) return;

        const searchArea = new SearchArea(this.originNode, farthestNodeInfo.position, farthestNodeInfo.scale);
        searchArea.draw(this.sensorDataCanvas);
    }

    drawDetections() {
        // Draw new sensor edges
        this.nearbyNodes.forEach(nodeData => {
            const sensorEdge = new SensorEdge(this.originNode, nodeData);
            sensorEdge.draw(this.sensorDataCanvas); // Draw within the sensor data group
        });

        this.nodesWithinExtendedRadius.forEach(nodeData => {
            const sensorEdge = new SensorEdge(this.originNode, nodeData, { stroke: 'none', fill: 'blue' });
            sensorEdge.draw(this.sensorDataCanvas); // Draw within the sensor data group
        });
    }

    clearSensorDrawings() {
        while (this.sensorDataCanvas.firstChild) {
            this.sensorDataCanvas.removeChild(this.sensorDataCanvas.firstChild);
        }
    }
}



class SearchArea {
    constructor(originNode, farthestPoint, farthestScale, style = {
        stroke: 'red',
        fill: 'none'
    }) {
        this.originNode = originNode;
        this.farthestPoint = farthestPoint;
        this.style = style;
        this.style['stroke-width'] = farthestScale * 52; // Scale the stroke width
        this.html = Svg.new.circle();
        this.applyStyle();
    }

    applyStyle() {
        for (const [key, value] of Object.entries(this.style)) {
            this.html.setAttribute(key, value);
        }
    }

    draw(svgGroup) {
        if (!this.farthestPoint) return; // Do nothing if farthestPoint is not set

        // Transform both the origin position and farthest point for SVG rendering
        const transformedOrigin = this.originNode.pos.toSvg();
        const transformedFarthestPoint = this.farthestPoint.toSvg();

        // Calculate radius as the direct distance to farthest point after transformation
        const radius = Math.sqrt(
            Math.pow(transformedOrigin.x - transformedFarthestPoint.x, 2) +
            Math.pow(transformedOrigin.y - transformedFarthestPoint.y, 2)
        );

        this.html.setAttribute('cx', transformedOrigin.x);
        this.html.setAttribute('cy', transformedOrigin.y);
        this.html.setAttribute('r', radius);

        svgGroup.appendChild(this.html);
    }
}



class SensorEdge {
    constructor(originNode, targetData, style = {
        fill: 'red',
        "stroke-width": '0' // No border stroke
    }) {
        this.originNode = originNode;
        this.targetData = targetData;
        this.style = style;
        this.html = Svg.new.path();
        this.applyStyle();
    }

    applyStyle() {
        for (const [key, value] of Object.entries(this.style)) {
            this.html.setAttribute(key, value);
        }
    }

    draw(svgGroup) {
        this.html.setAttribute('d', this.calculatePath());
        svgGroup.appendChild(this.html);
    }

    calculatePath() {
        const origin = this.originNode.pos.toSvg();
        const target = this.targetData.pos.toSvg();

        const normalizedDirection = target.minus(origin).normed();
        const perpendicular = normalizedDirection.rot90();

        // Increase the influence of node's scale and add perspective factor
        const widthFactor = 20; // Adjust this value to increase edge thickness
        const perspectiveFactor = 1.5; // Adjust this to enhance perspective effect

        const originScale = this.originNode.scale * widthFactor;
        const targetScale = this.targetData.scale * widthFactor * perspectiveFactor;

        const originPerpendicular = perpendicular.scale(originScale);
        const targetPerpendicular = perpendicular.scale(targetScale);

        const corner1 = origin.plus(originPerpendicular);
        const corner2 = origin.minus(originPerpendicular);
        const corner3 = target.plus(targetPerpendicular);
        const corner4 = target.minus(targetPerpendicular);

        return "M " + corner1 + " L " + corner3 + " L " + corner4 + " L " + corner2 + " Z";
    }
}
