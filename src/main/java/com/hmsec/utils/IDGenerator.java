package com.hmsec.utils;

import java.lang.management.ManagementFactory;
import java.net.*;
import java.util.Enumeration;
import java.util.UUID;

public class IDGenerator {
    private static String SERVER_IDENTITY;

    public static String getUUID() {
        return UUID.randomUUID().toString();
    }

    public static String getShortUUID() {
        long longValue = java.nio.ByteBuffer.wrap(IDGenerator.getUUID().getBytes()).getLong();
        return Long.toString(longValue, Character.MAX_RADIX);
    }

    public static String getServerIdentity() {
        if (SERVER_IDENTITY == null) {
            StringBuilder sb = new StringBuilder();
            try {
                sb.append(ManagementFactory.getRuntimeMXBean().getName());

                InetAddress ip = getFirstNonLoopbackAddress(true, false);
                if (ip != null) {
                    String hostAddress = ip.getHostAddress();
                    sb.append("|").append(hostAddress);
                }


                /*
                //Not working on linux
                NetworkInterface network = NetworkInterface.getByInetAddress(ip);
                byte[] mac = network.getHardwareAddress();
                String macAddress = String.format("%02X:%02X:%02X:%02X:%02X:%02X", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
                sb.append("|").append(macAddress);
                */
            } catch (SocketException e) {
                e.printStackTrace();
            }

            SERVER_IDENTITY = sb.toString();
        }

        return SERVER_IDENTITY;
    }

    private static InetAddress getFirstNonLoopbackAddress(boolean preferIpv4, boolean preferIPv6) throws SocketException {
        Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces();
        while (en.hasMoreElements()) {
            NetworkInterface i = en.nextElement();
            for (Enumeration<InetAddress> en2 = i.getInetAddresses(); en2.hasMoreElements(); ) {
                InetAddress addr = en2.nextElement();
                if (!addr.isLoopbackAddress()) {
                    if (addr instanceof Inet4Address) {
                        if (preferIPv6) {
                            continue;
                        }
                        return addr;
                    }
                    if (addr instanceof Inet6Address) {
                        if (preferIpv4) {
                            continue;
                        }
                        return addr;
                    }
                }
            }
        }
        return null;
    }

    public static void main(String[] args) {
        System.out.println(getServerIdentity());
    }
}
