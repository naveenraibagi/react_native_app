import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { fetchCategories } from '../../services/products.service';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';

export default function CategoryListScreen({ route, navigation }: any) {
    const { parentId } = route.params ?? {};
    const { colors, spacing, radius, fonts, shadows } = useTheme();

    const { data, isLoading } = useQuery({
        queryKey: ['categories', parentId ?? 0],
        queryFn: () => fetchCategories(parentId ?? 0),
    });

    const s = st(colors, spacing, radius, fonts);

    if (isLoading) return <SkeletonLoader rows={4} cols={2} cardHeight={120} />;
    if (!data?.length) return <EmptyState icon="grid-outline" title="No Categories" />;

    return (
        <FlatList
            data={data}
            numColumns={1} // Switching to single column for "Cover Photo" look
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={s.list}
            ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[s.card, shadows.md]}
                    onPress={() => navigation.navigate('ProductList', { categoryId: item.id, title: item.name })}
                    activeOpacity={0.9}
                >
                    <View style={s.imgContainer}>
                        {item.image ? (
                            <Image source={{ uri: item.image.src }} style={s.img} />
                        ) : (
                            <LinearGradient 
                                colors={[colors.primary + '22', colors.primary + '44']} 
                                style={s.img}
                            >
                                <Ionicons name="images-outline" size={48} color={colors.primary} />
                            </LinearGradient>
                        )}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={s.overlay}
                        />
                        <View style={s.info}>
                            <Text style={s.name}>{item.name}</Text>
                            <View style={s.badge}>
                                <Text style={s.count}>{item.count} PRODUCTS</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        list: { padding: spacing.base, paddingBottom: 120 },
        card: { 
            backgroundColor: colors.card, 
            borderRadius: radius.xl, 
            overflow: 'hidden',
        },
        imgContainer: {
            width: '100%',
            height: 180,
            position: 'relative',
        },
        img: { 
            width: '100%', 
            height: '100%', 
            alignItems: 'center', 
            justifyContent: 'center' 
        },
        overlay: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
        },
        info: {
            position: 'absolute',
            bottom: spacing.md,
            left: spacing.md,
            right: spacing.md,
        },
        name: { 
            fontSize: fonts.sizes.lg, 
            fontWeight: '800', 
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        badge: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: radius.sm,
            marginTop: 6,
            backdropFilter: 'blur(10px)',
        } as any,
        count: { 
            fontSize: 10, 
            fontWeight: '700',
            color: '#fff',
        },
    });
