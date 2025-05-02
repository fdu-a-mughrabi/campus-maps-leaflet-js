# User Guide

## What is this?
This project is a map that represents FDU's campuses. The guinea pig was the Metropolitan Campus. 

The map being recreated is the static 2D image of our campus map found on the following page
- https://www.fdu.edu/campuses/metropolitan-campus/maps-directions/

Information for buildings was grabbed from the following
- https://www.fdu.edu/campuses/metropolitan-campus/virtual-tour/

## Features
- Hightlighted perimeters of all campus buildings
- Names of buildings, a relevant image, and a description if applicable on most landmarks
- Waypoints for parking and dining areas, with toggles to turn them on or off
- A dropdown list of all locations on the map, with automatic panning and scrolling to landmarks
- Fully Responsive, works on mobile and desktop!

## How to Use
You can click on any of the waypoints to get the name of the landmark, a relevant image and description.

## Maintenance Guide
### Campus.KML
- This map is initially generated from the campus.kml file. This was the template of the map with all the waypoints set via Google My Maps.
- You can get this file by hitting the export option and selecting .kml format in the options

### I have to change an Image or Description
To change the image or description you will have to open the campus.kml file. Each waypoint is structured in such a way-

```
<Placemark>
        <name>1. Bancroft Hall</name>
        <description><![CDATA[<img src="https://www.fdu.edu/wp-content/uploads/2019/11/bancroft-hall.jpg" height="200" width="auto" /><br><br>Located on River Road, Bancroft Hall is the headquarters of the Peter Sammartino School of Education. The Metropolitan Campus offices of FDU Information Systems and Technology are also located in Bancroft Hall.]]></description>
        <styleUrl>#poly-01579B-1200-77</styleUrl>
        <ExtendedData>
          <Data name="gx_media_links">
            <value><![CDATA[https://www.fdu.edu/wp-content/uploads/2019/11/bancroft-hall.jpg]]></value>
          </Data>
        </ExtendedData>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <tessellate>1</tessellate>
              <coordinates>
                -74.0275095,40.8989676,0
                -74.0278563,40.8990718,0
                -74.0279599,40.8988742,0
                -74.0278087,40.8988291,0
                -74.0277621,40.89892,0
                -74.0275622,40.8988534,0
                -74.0275095,40.8989676,0
              </coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>
```

The important piece here is the <description> tag. This is what Omnivore (The KML parser in the JS file) uses to inject the landmark information in the pop-up. All you would need to do is change the inner contents of the "CDATA" bracket to be whatever changes you would like to make.

## I have to change the perimeter of a building
To change this you would upload the old campus.kml file, make your changes to the perimeter, export the file, and just replace the respective buildings coordinates from the old campus.kml file with the new campus.kml files information.

## I made a change and coordinates are showing up in the pop-up
This means you forgot to add a closing </description> tag

