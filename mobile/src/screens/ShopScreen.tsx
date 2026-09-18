import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Truck,
  ShieldCheck,
  Sparkles,
  X,
  Box,
  Image as ImageIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { BOUTIQUE_PRODUCTS } from '../data/boutiqueData';
import { BoutiqueProduct } from '../types';
import { useCircle } from '../context/CircleContext';
import { Sentia3DViewer } from '../components/Sentia3DViewer';
import { BAG_3D_MODELS } from '../assets/modelMap';

interface ShopScreenProps {
  onBack: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { cart, cartCount, cartTotalInr, addToCart, removeFromCart, clearCart, profile } =
    useCircle();

  const formatInr = (val?: number) => '₹' + (val ?? 0).toLocaleString('en-IN');

  const [selectedProduct, setSelectedProduct] = useState<BoutiqueProduct | null>(null);
  const [detailViewMode, setDetailViewMode] = useState<'2d' | '3d'>('2d');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'demo'>('cod');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState('');

  const getProduct3DMeta = (product?: BoutiqueProduct | null) => {
    if (!product || !product.bag3DModelId) return null;
    if (product.bag3DModelId !== 'bag-01' && product.bag3DModelId !== 'bag-03') return null;
    return BAG_3D_MODELS[product.bag3DModelId] || null;
  };

  const topInset =
    Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 20) + 8;

  const handleOpenProduct = (product: BoutiqueProduct) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedProduct(product);
    setDetailViewMode('2d');
    setActiveFaqIndex(null);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    const orderNum = `SNT-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setLastOrderNumber(orderNum);
    setOrderConfirmed(true);
    clearCart();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} translucent />

      {/* Top Header with Dynamic Safe Area Clearance */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton} activeOpacity={0.8}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>SENTIA BOUTIQUE</Text>
          <Text style={styles.headerSubtitle}>Curated Hardware & Upgrades</Text>
        </View>

        {/* Cart Trigger Badge */}
        <TouchableOpacity
          onPress={() => setIsCartOpen(true)}
          style={styles.cartBadgeButton}
          activeOpacity={0.8}
        >
          <ShoppingBag size={20} color={Colors.primary} />
          {cartCount > 0 && (
            <View style={styles.cartPill}>
              <Text style={styles.cartPillText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Product Catalog Grid */}
      <ScrollView
        contentContainerStyle={[styles.catalogContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial Banner */}
        <View style={styles.editorialCard}>
          <Sparkles size={18} color={Colors.primary} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.editorialTitle}>Artisanal Engineering</Text>
            <Text style={styles.editorialText}>
              All accessories interlock magnetically with your primary bag. Auto-fills your
              saved profile shipping details at checkout.
            </Text>
          </View>
        </View>

        {/* Products List */}
        {BOUTIQUE_PRODUCTS.map((prod) => (
          <TouchableOpacity
            key={prod.id}
            style={styles.productCard}
            onPress={() => handleOpenProduct(prod)}
            activeOpacity={0.85}
          >
            <View style={styles.productVisualWrap}>
              <Image source={prod.image} style={styles.productThumb} resizeMode="contain" />
              {prod.badge && (
                <View style={styles.productBadge}>
                  <Text style={styles.productBadgeText}>{prod.badge}</Text>
                </View>
              )}
            </View>

            <View style={styles.productDetails}>
              <View>
                <Text style={styles.productName} numberOfLines={1}>
                  {prod.name}
                </Text>
                <Text style={styles.productTagline} numberOfLines={2}>
                  {prod.tagline}
                </Text>
                <View style={styles.ratingRow}>
                  <Star size={12} color="#D97706" fill="#D97706" />
                  <Text style={styles.ratingText}>
                    {prod.rating} ({prod.reviewsCount})
                  </Text>
                </View>
              </View>

              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.priceLabel}>PRICE</Text>
                  <Text style={styles.priceText}>{formatInr(prod.priceInr)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.addToCartQuick}
                  onPress={() => addToCart(prod)}
                  activeOpacity={0.8}
                >
                  <Plus size={13} color="#FAF6EE" style={{ marginRight: 4 }} />
                  <Text style={styles.addToCartQuickText}>Add to Bag</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Details Modal with Specs, Reviews & Q&A Accordion */}
      {selectedProduct && (
        <Modal
          visible={!!selectedProduct}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedProduct(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{selectedProduct.name}</Text>
                <TouchableOpacity
                  onPress={() => setSelectedProduct(null)}
                  style={styles.sheetCloseButton}
                >
                  <X size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.sheetScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.modalImageWrap}>
                  {getProduct3DMeta(selectedProduct) && (
                    <TouchableOpacity
                      style={styles.modalFloatingBadge}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch {}
                        setDetailViewMode((prev) => (prev === '2d' ? '3d' : '2d'));
                      }}
                      activeOpacity={0.8}
                      accessibilityLabel={
                        detailViewMode === '3d'
                          ? 'Switch to 2D studio photo'
                          : 'Switch to 3D interactive model'
                      }
                    >
                      {detailViewMode === '3d' ? (
                        <>
                          <ImageIcon size={11} color={Colors.primary} style={{ marginRight: 3 }} />
                          <Text style={styles.floatingBadgeText}>2D</Text>
                        </>
                      ) : (
                        <>
                          <Box size={11} color={Colors.primary} style={{ marginRight: 3 }} />
                          <Text style={styles.floatingBadgeText}>3D</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {detailViewMode === '3d' && getProduct3DMeta(selectedProduct) ? (
                    <Sentia3DViewer
                      modelMeta={getProduct3DMeta(selectedProduct)!}
                      height={240}
                      autoRotate={true}
                    />
                  ) : (
                    <Image
                      source={selectedProduct.image}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  )}
                </View>

                <View style={styles.modalPriceRatingRow}>
                  <Text style={styles.modalPrice}>{formatInr(selectedProduct.priceInr)}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={14} color="#D97706" fill="#D97706" />
                    <Text style={styles.modalRatingText}>
                      {selectedProduct.rating} • {selectedProduct.reviewsCount} Verified Reviews
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalDesc}>{selectedProduct.description}</Text>

                {/* Technical Specifications */}
                <Text style={styles.sectionHeader}>Engineered Specifications</Text>
                <View style={styles.specsCard}>
                  {selectedProduct.specs.map((sp, idx) => (
                    <View key={idx} style={styles.specRow}>
                      <Text style={styles.specLabel}>{sp.label}</Text>
                      <Text style={styles.specValue}>{sp.value}</Text>
                    </View>
                  ))}
                </View>

                {/* How to Use Step-by-Step */}
                <Text style={styles.sectionHeader}>How to Pair & Use</Text>
                <View style={styles.stepsCard}>
                  {selectedProduct.howToUseSteps.map((step, idx) => (
                    <View key={idx} style={styles.stepRow}>
                      <View style={styles.stepNumCircle}>
                        <Text style={styles.stepNumText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>

                {/* Product Q&A / FAQ Accordion */}
                <Text style={styles.sectionHeader}>Questions & Verified Answers</Text>
                <View style={styles.faqCard}>
                  {selectedProduct.faq.map((item, idx) => {
                    const isOpen = activeFaqIndex === idx;
                    return (
                      <View key={idx} style={styles.faqItem}>
                        <TouchableOpacity
                          style={styles.faqHeader}
                          onPress={() => setActiveFaqIndex(isOpen ? null : idx)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.faqQuestion}>{item.question}</Text>
                          {isOpen ? (
                            <ChevronUp size={16} color={Colors.primary} />
                          ) : (
                            <ChevronDown size={16} color={Colors.textTertiary} />
                          )}
                        </TouchableOpacity>
                        {isOpen && <Text style={styles.faqAnswer}>{item.answer}</Text>}
                      </View>
                    );
                  })}
                </View>

                {/* Customer Reviews */}
                <Text style={styles.sectionHeader}>Verified Owner Reviews</Text>
                {selectedProduct.reviews.map((rev) => (
                  <View key={rev.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewUser}>{rev.userName}</Text>
                      <View style={styles.verifiedPill}>
                        <CheckCircle size={10} color={Colors.statusSuccess} />
                        <Text style={styles.verifiedText}>Verified Buyer</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>"{rev.comment}"</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Bottom Action Drawer */}
              <View style={[styles.modalBottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity
                  style={styles.addToBagModalButton}
                  onPress={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                    setIsCartOpen(true);
                  }}
                  activeOpacity={0.8}
                >
                  <ShoppingBag size={16} color="#FAF6EE" style={{ marginRight: 8 }} />
                  <Text style={styles.addToBagModalText}>
                    Add to Bag • {formatInr(selectedProduct.priceInr)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Slide-Up Cart & Checkout Drawer */}
      <Modal
        visible={isCartOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCartOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '92%' }]}>
            <View style={styles.sheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShoppingBag size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sheetTitle}>Your Shopping Bag</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCartOpen(false)}
                style={styles.sheetCloseButton}
              >
                <X size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyCartWrap}>
                <ShoppingBag size={48} color={Colors.cardAccentBorder} />
                <Text style={styles.emptyCartTitle}>Your bag is empty</Text>
                <Text style={styles.emptyCartSub}>Explore the Sentia Boutique for upgrades.</Text>
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.cartScroll} showsVerticalScrollIndicator={false}>
                {/* Cart Items */}
                {cart.map((item) => (
                  <View key={item.product.id} style={styles.cartItemCard}>
                    <Image
                      source={item.product.image}
                      style={styles.cartItemThumb}
                      resizeMode="contain"
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.cartItemName}>{item.product.name}</Text>
                      <Text style={styles.cartItemPrice}>
                        {formatInr(item.product.priceInr * item.quantity)} ({formatInr(item.product.priceInr)} each)
                      </Text>

                      <View style={styles.cartQtyRow}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => removeFromCart(item.product.id)}
                        >
                          <Minus size={12} color={Colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => addToCart(item.product, 1)}
                        >
                          <Plus size={12} color={Colors.textPrimary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Auto-Filled Shipping Address from Profile */}
                <Text style={styles.sectionHeader}>Shipping Destination</Text>
                <View style={styles.shippingCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Truck size={14} color={Colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.shippingName}>{profile.fullName || 'Sentia Executive'}</Text>
                  </View>
                  <Text style={styles.shippingPhone}>{profile.phone || '+91 98401 23456'}</Text>
                  <Text style={styles.shippingAddress}>
                    {profile.shippingAddress || 'Indiranagar, Bengaluru, KA 560038'}
                  </Text>
                  <Text style={styles.shippingAutoNote}>
                    Auto-populated from your verified profile
                  </Text>
                </View>

                {/* Payment Method Selector */}
                <Text style={styles.sectionHeader}>Payment Method</Text>
                <View style={styles.paymentSelector}>
                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      styles.paymentOptionSelected,
                    ]}
                    onPress={() => setPaymentMethod('cod')}
                    activeOpacity={0.8}
                  >
                    <Truck size={16} color={Colors.primary} />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.paymentOptionTitle}>Cash on Delivery (COD)</Text>
                      <Text style={styles.paymentOptionSub}>White-glove payment upon delivery at your door</Text>
                    </View>
                  </TouchableOpacity>

                  <View
                    style={[
                      styles.paymentOption,
                      { opacity: 0.55, borderColor: Colors.cardAccentBorder, backgroundColor: Colors.canvasElevated },
                    ]}
                  >
                    <CreditCard size={16} color={Colors.textTertiary} />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[styles.paymentOptionTitle, { color: Colors.textSecondary }]}>Razorpay / Card / UPI</Text>
                        <View style={{ backgroundColor: Colors.cardAccentBorder, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.5 }}>NOT AVAILABLE AT THE MOMENT</Text>
                        </View>
                      </View>
                      <Text style={styles.paymentOptionSub}>Online payment gateway in scheduled boutique upgrade</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Checkout Action Footer */}
            {cart.length > 0 && (
              <View style={[styles.checkoutFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalAmount}>{formatInr(cartTotalInr)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.placeOrderButton}
                  onPress={handlePlaceOrder}
                  activeOpacity={0.85}
                >
                  <ShieldCheck size={16} color="#FAF6EE" style={{ marginRight: 8 }} />
                  <Text style={styles.placeOrderText}>
                    Confirm Order • Cash on Delivery
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Order Confirmation Receipt Modal */}
      <Modal visible={orderConfirmed} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptCard}>
            <View style={styles.receiptCheckCircle}>
              <CheckCircle size={36} color="#10B981" />
            </View>
            <Text style={styles.receiptTitle}>Order Confirmed</Text>
            <Text style={styles.receiptOrderNum}>{lastOrderNumber}</Text>
            <Text style={styles.receiptDesc}>
              Your artisanal Sentia hardware order has been registered. Dispatched to{' '}
              {profile.shippingAddress}.
            </Text>
            <TouchableOpacity
              style={styles.receiptDoneButton}
              onPress={() => {
                setOrderConfirmed(false);
                setIsCartOpen(false);
              }}
            >
              <Text style={styles.receiptDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardAccentBorder,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvasElevated,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  cartBadgeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvasElevated,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartPill: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.primary,
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FAF6EE',
  },
  catalogContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  editorialCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardAccent,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
  },
  editorialTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  editorialText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  productCard: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    flexDirection: 'row',
    minHeight: 136,
    ...Shadows.card,
  },
  productVisualWrap: {
    width: 96,
    height: 96,
    borderRadius: 14,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  productThumb: {
    width: 76,
    height: 76,
  },
  productBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  productBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FAF6EE',
  },
  productDetails: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  productTagline: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
    lineHeight: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.cardAccentBorder,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  addToCartQuick: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartQuickText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 31, 26, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.floating,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardAccentBorder,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sheetCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.canvasElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScroll: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  modalImageWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.canvasElevated,
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    minHeight: 190,
  },
  modalImage: {
    width: '100%',
    height: 180,
  },
  modalPriceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  modalRatingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  specsCard: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.canvasWarm,
  },
  specLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stepsCard: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  stepNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  stepText: {
    fontSize: 12,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  faqCard: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  faqItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.canvasWarm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginTop: 6,
  },
  reviewCard: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 14,
    padding: Spacing.md,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewUser: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 10,
    color: Colors.statusSuccess,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  modalBottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.cardAccentBorder,
    backgroundColor: Colors.canvasElevated,
  },
  addToBagModalButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToBagModalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  emptyCartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyCartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptyCartSub: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  cartScroll: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.canvasElevated,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  cartItemThumb: {
    width: 60,
    height: 60,
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cartItemPrice: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  cartQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.canvas,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginHorizontal: 12,
  },
  shippingCard: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  shippingName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  shippingPhone: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  shippingAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  shippingAutoNote: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.statusSuccess,
    marginTop: 6,
  },
  paymentSelector: {
    marginTop: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasElevated,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardAccent,
  },
  paymentOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  paymentOptionSub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  checkoutFooter: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.canvasElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.cardAccentBorder,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  totalLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  placeOrderButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  receiptCard: {
    width: '85%',
    backgroundColor: Colors.canvas,
    borderRadius: 24,
    padding: Spacing.xxl,
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.floating,
  },
  receiptCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  receiptOrderNum: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
    letterSpacing: 1,
  },
  receiptDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 18,
  },
  receiptDoneButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
    paddingVertical: 12,
    paddingHorizontal: 36,
    marginTop: Spacing.xl,
  },
  receiptDoneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  modalFloatingBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 246, 238, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
});
