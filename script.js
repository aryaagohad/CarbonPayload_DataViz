const data = {
    name: "CO2 Emissions",
    children: [
        {
            name: "Sending Emails",
            children: [
                { 
                    name: "Recipients", 
                    children: [
                        { name: "Individual", children: [{ name: "0.3g per person", value: 0.3 }] },
                        { name: "Group", children: [{ name: "0.5g per person", value: 0.5 }] }
                    ]
                },
                { 
                    name: "Documents", 
                    children: [
                        { name: "Small Files", children: [{ name: "10g per MB", value: 10 }] },
                        { name: "Large Files", children: [{ name: "30g per MB", value: 30 }] }
                    ]
                }
            ]
        },
        {
            name: "Receiving Emails",
            children: [
                { 
                    name: "Device", 
                    children: [
                        { name: "Laptop", children: [{ name: "0.3g per mail", value: 0.3 }] },
                        { name: "Phone", children: [{ name: "0.2g per mail", value: 0.2 }] }
                    ]
                },
                { 
                    name: "Subscriptions", 
                    children: [
                        { name: "Daily", children: [{ name: "10g per newsletter", value: 10 }] },
                        { name: "Weekly", children: [{ name: "30g per newsletter", value: 30 }] }
                    ]
                }
            ]
        }
    ]
};

const width = 800; // Keep the original width
const height = 800; // Keep the original height

const svg = d3.select("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("font", "10px sans-serif");

const pack = d3.pack()
    .size([width, height])
    .padding(3);

const root = d3.hierarchy(data)
    .sum(d => d.value || 0)
    .sort((a, b) => b.value - a.value);

const nodes = pack(root).descendants();

let focus = root; // Track the currently focused node

const zoomTo = (v) => {
    const k = Math.min(width, height) / v[2]; // Scale factor
    svg.transition()
        .duration(750)
        .attr("viewBox", `${v[0] - v[2] / 2} ${v[1] - v[2] / 2} ${v[2]} ${v[2]}`);
};

const render = () => {
    const circle = svg.selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("fill", d => {
            if (d.depth === 0) return "#10202D";
            if (d.depth === 1) return "#253745";
            if (d.depth === 2) return "#99A5A9";
            if (d.depth === 3) return "#FFC233";
            return "#ddd";
        })
        .attr("stroke", "none") // No border initially
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .on("click", (event, d) => {
            if (focus !== d) {
                focus = d;
                zoomTo([d.x, d.y, d.r * 2]);
                // Show text when clicked
                svg.selectAll("text")
                    .style("opacity", t => (t === d) ? 1 : 0); // Show only text for the clicked node
            }
        })
        .on("mouseover", function(event, d) {
            if (d.depth > 0) { // Only add border if depth > 0 (not the innermost circle)
                d3.select(this).attr("stroke", "#FFC233").attr("stroke-width", 2); // Add yellow border on hover
            }
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("stroke", "none"); // Remove border on mouseout
        });

    const text = svg.selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("dy", "0.3em")
        .style("text-anchor", "middle")
        .style("font-size", d => {
            // Calculate the font size based on the circle's radius
            const baseFontSize = Math.max(8, d.r / 6); // Reduced font size for better fit
            return `${baseFontSize}px`;
        })
        .style("pointer-events", "none")
        .style("opacity", 0) // Start with text hidden
        .style("fill", "#10202D") // Deep blue color for text
        .text(d => d.depth > 0 ? d.data.name : ""); // Only display text for depth > 0 (remove CO2 Emissions)

    zoomTo([focus.x, focus.y, focus.r * 2]);
};

render();
