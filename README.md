# SRTM tiles downloader



## Process to generate GeoJSON tiles grid for SRTMGL1 data (1 arc or around 30m)

Normally, you will not need to generate GeoJSON grid as it's already done.

If for any reasons, there is an update on NASA website, generating GeoJSON can be done with

    XMLINFOS=1 node scripts/srtm_1arc_tiles_to_geojson.js

The script get list of pages referencing tiles. For each page, we get the tiles infos list we merge. Then, we retrieve XMLs that contains metadata about extent of each tiles.
With the extent and the previous infos, we build the GeoJSON.

If you don't provide XMLINFOS=1, you will generate GeoJSON using remote list of tiles pages and local XMLs files already downloaded to avoid donwloading them again (too long).