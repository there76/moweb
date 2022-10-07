package com.hmsec.moweb.resolver;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.util.Arrays;
import java.util.Set;

@Slf4j
public class UploadFileResourceResolver extends PathResourceResolver {

    private final Set<String> allowedExtensionSet;

    private boolean isCheckAllowedExtension = false;


    public UploadFileResourceResolver(Set<String> allowedExtensionSet) {
        this.allowedExtensionSet = allowedExtensionSet;
        if (allowedExtensionSet.size() > 0) {
            isCheckAllowedExtension = true;
            log.info("allowedExtensionSet {}", allowedExtensionSet);
        }
    }

    @Override
    protected Resource getResource(String resourcePath, Resource location) throws IOException {
        Resource resource = location.createRelative(resourcePath);
        if (resource.isReadable()) {
            if (!checkAllowedExtensions(resource)) {
                if (log.isDebugEnabled()) {
                    log.debug("Resource path \"" + resourcePath + "\" was successfully resolved " + "but resource \""
                            + resource.getURL() + "\" is not in apps.upload.allowedAccessExtensions ");
                }
                return null;
            }

            if (checkResource(resource, location)) {
                return resource;
            } else if (log.isDebugEnabled()) {
                Resource[] allowedLocations = getAllowedLocations();
                log.debug("Resource path \"" + resourcePath + "\" was successfully resolved " + "but resource \""
                        + resource.getURL() + "\" is neither under the " + "current location \"" + location.getURL()
                        + "\" nor under any of the " + "allowed locations "
                        + (allowedLocations != null ? Arrays.asList(allowedLocations) : "[]"));
            }
        }
        return null;
    }

    private boolean checkAllowedExtensions(Resource resource) {
        if (isCheckAllowedExtension) {
            String extension = getExtension(resource.getFilename());
            return allowedExtensionSet.contains(extension);
        }
        return true;
    }

    private String getExtension(final String filename) {
        if (filename == null) {
            return null;
        }
        final int index = filename.lastIndexOf('.');
        if (index == -1) {
            return "";
        } else {
            return filename.substring(index + 1).toLowerCase();
        }
    }
}
