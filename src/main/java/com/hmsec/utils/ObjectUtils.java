package com.hmsec.utils;

import lombok.extern.slf4j.Slf4j;

import java.beans.IntrospectionException;
import java.beans.PropertyDescriptor;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.lang.reflect.Array;
import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.util.*;
import java.util.jar.JarEntry;
import java.util.jar.JarInputStream;


@Slf4j
public class ObjectUtils {
    private ObjectUtils() {
        //prevent new
    }

    public static boolean isEmpty(Object obj) {
        if (obj instanceof String) return "".equals(obj.toString().trim());
        else if (obj instanceof List) return ((List) obj).isEmpty();
        else if (obj instanceof Map) return ((Map) obj).isEmpty();
        else if (obj instanceof Object[]) return Array.getLength(obj) == 0;
        else return obj == null;
    }

    /**
     * 패키지를 제외한 fullName. innerClass의 경우 부모 클래스의 이름까지 포함된다.
     * <p>
     * UserType
     * Conversation$Attribute
     */
    public static String getSimpleFullName(Class<?> clazz) {
        String name = clazz.getName();
        name = name.substring(name.lastIndexOf('.') + 1);
        return name;
    }

    public static boolean isNotEmpty(String s) {
        return !isEmpty(s);
    }

    public static void callSetter(Object obj, String fieldName, Object value) {
        PropertyDescriptor pd;
        try {
            pd = new PropertyDescriptor(fieldName, obj.getClass());
            pd.getWriteMethod().invoke(obj, value);
        } catch (IntrospectionException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
            e.printStackTrace();
        }
    }

    public static Object callGetter(Object obj, String fieldName) {
        PropertyDescriptor pd;
        try {
            pd = new PropertyDescriptor(fieldName, obj.getClass());
            return pd.getReadMethod().invoke(obj);
        } catch (IntrospectionException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
            e.printStackTrace();
        }
        return null;
    }


    /**
     * Scans all classes accessible from the context class loader which belong to the given package and subpackages.
     *
     * @param packageName The base package
     * @param filter      search filter (java.lang.Enum.class, java.lang.Class.class, java.lang.Enum.class)
     * @return The classes
     * @throws ClassNotFoundException
     * @throws IOException            java.lang.Enum.class
     */
    public static Class[] getClasses(String packageName, Class<?> filter)
            throws ClassNotFoundException, IOException {

        //ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        ClassLoader classLoader = ObjectUtils.class.getClassLoader();

        assert classLoader != null;
        String path = packageName.replace('.', '/');
        Enumeration<URL> resources = classLoader.getResources(path);
        List<File> dirs = new ArrayList<>();
        List<File> jars = new ArrayList<>();
        List<File> wars = new ArrayList<>();

        log.info("packageName = {}, path = {}", packageName, path);

        while (resources.hasMoreElements()) {
            URL resource = resources.nextElement();

            log.info("resource = {}, resourceFile = {}", resource, resource.getFile());


            if (resource.getFile().contains(".jar!")) {
                String p = resource.getFile().split("!")[0];
                if (p.startsWith("file:")) {
                    p = p.substring(5);//file: 제거
                }

                jars.add(new File(p));
            } else if (resource.getFile().contains(".war!")) {
                String p = resource.getFile().split("!")[0];
                if (p.startsWith("file:")) {
                    p = p.substring(5);//file: 제거
                }

                wars.add(new File(p));
            } else {
                dirs.add(new File(resource.getFile()));
            }

        }
        ArrayList<Class> classes = new ArrayList<>();

        log.info("jars = {}, wars = {}, dirs = {}", jars, wars, dirs);

        for (File directory : dirs) {
            classes.addAll(findClasses(directory, packageName, filter));
        }

        for (File jar : jars) {
            classes.addAll(findClassesInJar(jar, packageName, filter));
        }

        for (File war : wars) {
            classes.addAll(findClassesInWar(war, packageName, filter));
        }

        log.info("classes = {}", classes);

        return classes.toArray(new Class[classes.size()]);
    }

    public static List<Class> findClassesInJar(File jarFile, String packageName, Class<?> filter) throws ClassNotFoundException, IOException {
        List<Class> classes = new ArrayList<>();
        JarInputStream crunchifyJarFile = null;
        try {
            crunchifyJarFile = new JarInputStream(new FileInputStream(jarFile));
            JarEntry crunchifyJar;
            while (true) {
                crunchifyJar = crunchifyJarFile.getNextJarEntry();
                if (crunchifyJar == null) {
                    break;
                }

                if ((crunchifyJar.getName().endsWith(".class"))) {
                    String className = crunchifyJar.getName().replaceAll("/", "\\.");
                    if (className.startsWith(packageName)) {
                        String myClass = className.substring(0, className.lastIndexOf('.'));
                        try {
                            Class clazz = Class.forName(myClass);
                            if (filter == Enum.class) {
                                if (clazz.isEnum()) {
                                    classes.add(clazz);
                                }
                            } else {
                                classes.add(clazz);
                            }
                        } catch (NoClassDefFoundError nc) {
                            //ignore
                            log.error("error {}", nc.getMessage());
                        }
                    }
                }
            }

        } catch (IOException e) {
            log.error("error ", e);
        } finally {
            if (crunchifyJarFile != null) {
                crunchifyJarFile.close();
            }
        }

        return classes;
    }

    public static List<Class> findClassesInWar(File warFile, String packageName, Class<?> filter) throws ClassNotFoundException, IOException {
        List<Class> classes = new ArrayList<>();
        JarInputStream crunchifyWarFile = null;
        try {
            crunchifyWarFile = new JarInputStream(new FileInputStream(warFile));
            JarEntry crunchifyWar;
            while (true) {
                crunchifyWar = crunchifyWarFile.getNextJarEntry();
                if (crunchifyWar == null) {
                    break;
                }

                if ((crunchifyWar.getName().endsWith(".class"))) {
                    String className = crunchifyWar.getName().replaceAll("WEB-INF/classes/", "").replaceAll("/", "\\.");
                    if (className.startsWith(packageName)) {
                        String myClass = className.substring(0, className.lastIndexOf('.'));
                        try {
                            Class clazz = Class.forName(myClass);
                            if (filter == Enum.class) {
                                if (clazz.isEnum()) {
                                    classes.add(clazz);
                                }
                            } else {
                                classes.add(clazz);
                            }
                        } catch (NoClassDefFoundError nc) {
                            //ignore
                            log.error("error {}", nc.getMessage());
                        }
                    }
                }
            }

        } catch (IOException e) {
            log.error("error ", e);
        } finally {
            if (crunchifyWarFile != null) {
                crunchifyWarFile.close();
            }
        }

        return classes;
    }

    /**
     * Recursive method used to find all classes in a given directory and subdirs.
     *
     * @param directory   The base directory
     * @param packageName The package name for classes found inside the base directory
     * @return The classes
     * @throws ClassNotFoundException
     */
    public static List<Class> findClasses(File directory, String packageName, Class<?> filter) throws ClassNotFoundException {
        List<Class> classes = new ArrayList<>();
        if (!directory.exists()) {
            return classes;
        }
        File[] files = directory.listFiles();
        if (files == null) {
            return classes;
        }

        for (File file : files) {
            if (file.isDirectory()) {
                assert !file.getName().contains(".");
                classes.addAll(findClasses(file, packageName + "." + file.getName(), filter));
            } else if (file.getName().endsWith(".class")) {
                Class clazz = Class.forName(packageName + '.' + file.getName().substring(0, file.getName().length() - 6));
                if (filter == Enum.class) {
                    if (clazz.isEnum()) {
                        classes.add(clazz);
                    }
                } else {
                    classes.add(clazz);
                }
            }
        }
        return classes;
    }

    private static List<File> getVfsFileFiles(File dir) {

        if (dir == null || !dir.exists() || !dir.isDirectory()) {
            return null;
        }


        if (!dir.getName().contains(".jar")) {
            return getVfsFileFiles(dir.getParentFile());
        }

        File jarFiles[] = dir.listFiles(pathname -> pathname.isFile() && pathname.getName().endsWith(".jar"));

        return jarFiles == null ? null : Arrays.asList(jarFiles);
    }

    public static void main(String[] args) throws Exception {
         System.out.println(ObjectUtils.getVfsFileFiles(new File("/Users/p.kanil/Desktop/aa/bb/cc/asdf.jar-sadfasf/contents/com/ubicus/moca")));
    }


}
