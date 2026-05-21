"use client"

import { db } from "@/lib/firebase"
import { ref, onValue, push, set } from "firebase/database"
import { useState, useEffect } from "react"
import {
  Search,
  ShoppingCart,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Plus,
  Minus,
  Trash2,
  User,
  BarChart3,
  Store,
  Users,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  Package,
  Eye,
  Edit,
  Check,
  MessageCircle,
  Heart,
  Share2,
  Filter,
  Gift,
  Award,
  Sparkles,
  ChefHat,
  Truck,
  CreditCard,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

// Types
interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  rating: number
  reviews: number
  isPopular?: boolean
  isNew?: boolean
  discount?: number
}

interface Restaurant {
  id: number
  name: string
  logo: string
  cover: string
  cuisine: string
  rating: number
  reviews: number
  deliveryTime: string
  deliveryFee: number
  minOrder: number
  isOpen: boolean
  isFeatured?: boolean
  address: string
  phone: string
}

interface CartItem extends MenuItem {
  quantity: number
  restaurantId: number
}

interface Order {
  id: string
  items: CartItem[]
  status: "pending" | "preparing" | "ready" | "delivering" | "delivered"
  total: number
  date: string
  restaurantName: string
}

// Sample Data
const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "مطعم الشرق",
    logo: "🏮",
    cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    cuisine: "مأكولات شرقية",
    rating: 4.8,
    reviews: 523,
    deliveryTime: "25-35",
    deliveryFee: 5,
    minOrder: 30,
    isOpen: true,
    isFeatured: true,
    address: "شارع التحرير، القاهرة",
    phone: "+20 123 456 789",
  },
  {
    id: 2,
    name: "بيتزا إيطاليانو",
    logo: "🍕",
    cover: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    cuisine: "إيطالي",
    rating: 4.6,
    reviews: 412,
    deliveryTime: "20-30",
    deliveryFee: 7,
    minOrder: 40,
    isOpen: true,
    isFeatured: true,
    address: "المعادي، القاهرة",
    phone: "+20 111 222 333",
  },
  {
    id: 3,
    name: "سوشي ماستر",
    logo: "🍣",
    cover: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    cuisine: "ياباني",
    rating: 4.9,
    reviews: 287,
    deliveryTime: "30-45",
    deliveryFee: 10,
    minOrder: 60,
    isOpen: true,
    address: "الزمالك، القاهرة",
    phone: "+20 100 200 300",
  },
  {
    id: 4,
    name: "برجر هاوس",
    logo: "🍔",
    cover: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    cuisine: "أمريكي",
    rating: 4.5,
    reviews: 678,
    deliveryTime: "15-25",
    deliveryFee: 5,
    minOrder: 25,
    isOpen: true,
    isFeatured: true,
    address: "مدينة نصر، القاهرة",
    phone: "+20 155 666 777",
  },
  {
    id: 5,
    name: "كشري التحرير",
    logo: "🍲",
    cover: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    cuisine: "مصري",
    rating: 4.7,
    reviews: 1205,
    deliveryTime: "10-20",
    deliveryFee: 3,
    minOrder: 15,
    isOpen: false,
    address: "وسط البلد، القاهرة",
    phone: "+20 122 333 444",
  },
  {
    id: 6,
    name: "مشويات الملك",
    logo: "🥩",
    cover: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    cuisine: "مشويات",
    rating: 4.8,
    reviews: 890,
    deliveryTime: "25-40",
    deliveryFee: 8,
    minOrder: 50,
    isOpen: true,
    address: "الدقي، الجيزة",
    phone: "+20 166 777 888",
  },
]

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "شاورما لحم",
    description: "شاورما لحم طازجة مع صلصة الثوم والمخللات",
    price: 45,
    image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&q=80",
    category: "شاورما",
    rating: 4.9,
    reviews: 234,
    isPopular: true,
  },
  {
    id: 2,
    name: "فتة باللحمة",
    description: "فتة تقليدية باللحم البلدي والأرز",
    price: 65,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    category: "أطباق رئيسية",
    rating: 4.7,
    reviews: 156,
    isNew: true,
  },
  {
    id: 3,
    name: "كباب مشكل",
    description: "تشكيلة من الكباب والكفتة مع الخبز والسلطة",
    price: 85,
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&q=80",
    category: "مشويات",
    rating: 4.8,
    reviews: 312,
    isPopular: true,
    discount: 15,
  },
  {
    id: 4,
    name: "سلطة سيزر",
    description: "خس طازج مع صدر دجاج مشوي وصوص السيزر",
    price: 35,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80",
    category: "سلطات",
    rating: 4.5,
    reviews: 89,
  },
  {
    id: 5,
    name: "عصير مانجو",
    description: "عصير مانجو طبيعي طازج",
    price: 20,
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80",
    category: "مشروبات",
    rating: 4.6,
    reviews: 167,
  },
  {
    id: 6,
    name: "كنافة نابلسية",
    description: "كنافة بالجبنة الطازجة مع القطر",
    price: 40,
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&q=80",
    category: "حلويات",
    rating: 4.9,
    reviews: 445,
    isPopular: true,
  },
  {
    id: 7,
    name: "فول بالطحينة",
    description: "فول مدمس بزيت الزيتون والطحينة",
    price: 18,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80",
    category: "فطور",
    rating: 4.4,
    reviews: 203,
  },
  {
    id: 8,
    name: "مسقعة",
    description: "باذنجان مقلي مع صلصة الطماطم واللحم المفروم",
    price: 55,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
    category: "أطباق رئيسية",
    rating: 4.6,
    reviews: 178,
    isNew: true,
  },
]

const governorates = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الدقهلية",
  "الشرقية",
  "المنوفية",
  "الغربية",
  "كفر الشيخ",
  "البحيرة",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "شمال سيناء",
  "جنوب سيناء",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "البحر الأحمر",
  "الوادي الجديد",
  "مطروح",
]

const categories = ["الكل", "شاورما", "مشويات", "أطباق رئيسية", "سلطات", "مشروبات", "حلويات", "فطور"]

// Stats for admin dashboard
const dashboardStats = {
  totalOrders: 1542,
  totalRevenue: 45230,
  totalRestaurants: 24,
  totalCustomers: 3421,
  ordersGrowth: 12.5,
  revenueGrowth: 8.3,
  topItems: [
    { name: "شاورما لحم", orders: 342, revenue: 15390 },
    { name: "كباب مشكل", orders: 287, revenue: 24395 },
    { name: "كنافة نابلسية", orders: 256, revenue: 10240 },
  ],
}

const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
  try {
    const orderRef = ref(db, `orders/${orderId}`);
    await set(ref(db, `orders/${orderId}/status`), newStatus);
    alert("تم تحديث حالة الطلب!");
  } catch (error) {
    console.error(error);
  }
};



export default function FoodiePlatform() {
  const [newRestData, setNewRestData] = useState({ name: "", cuisine: "", cover: "" });
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>(restaurants); // سنبدأ بالبيانات القديمة ونضيف عليها
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [realOrders, setRealOrders] = useState<any[]>([]); // لحفظ الطلبات من فيرباس
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeView, setActiveView] = useState<"home" | "restaurant" | "admin" | "profile">("home")
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [selectedGovernorate, setSelectedGovernorate] = useState("القاهرة")
  const [userRole, setUserRole] = useState<"customer" | "restaurant" | "admin">("customer")
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      items: [],
      status: "preparing",
      total: 150,
      date: "2024-01-15",
      restaurantName: "مطعم الشرق",
    },
    {
      id: "ORD-002",
      items: [],
      status: "delivering",
      total: 85,
      date: "2024-01-14",
      restaurantName: "بيتزا إيطاليانو",
    },
  ])
  const [loyaltyPoints, setLoyaltyPoints] = useState(250)
  
  // استبدل الـ useEffect القديم أو أضف هذا بجانبه
useEffect(() => {
  // سحب المطاعم من Firebase
  const restRef = ref(db, 'restaurants');
  onValue(restRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      // دمج المطاعم الافتراضية مع المطاعم الجديدة من الفايربيس
      setAllRestaurants([...restaurants, ...list]);
    }
  });
  }, []);

// دالة لحفظ الطلب الجديد في Firebase
const handleCheckout = async () => {
  if (cart.length === 0) return;

  const newOrder = {
    items: cart,
    total: cartTotal + 10,
    status: "pending",
    date: new Date().toISOString(),
    customerName: "عميل تجريبي", // ممكن نغيرها بعدين لما نعمل Login
  };

  try {
    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    await set(newOrderRef, newOrder);
    
    alert("تم إرسال طلبك بنجاح وحفظه في Firebase!");
    setCart([]);
    setIsCartOpen(false);
  } catch (error) {
    console.error("Error saving order:", error);
    alert("حدث خطأ أثناء حفظ الطلب.");
  }
};

// كود فلترة المطاعم الآمن (يمنع حدوث الـ Error اللي ظهرلك)
const displayRestaurants = allRestaurants.filter((r) => {
  // بنتأكد إن البيانات موجودة فعلاً قبل ما نبحث فيها، ولو مش موجودة بنعتبرها نص فارغ ""
  const name = r.name || "";
  const cuisine = r.cuisine || "";
  const address = r.address || "";
  const query = searchQuery || "";

  const matchesSearch = name.includes(query) || cuisine.includes(query);
  const matchesGov = selectedGovernorate === "الكل" || address.includes(selectedGovernorate);

  return matchesSearch && matchesGov;
});

// ونفس الكلام لفلترة الأصناف
const displayMenuItems = menuItems.filter((item) => {
  const category = item.category || "";
  return selectedCategory === "الكل" || category === selectedCategory;
});

const deleteRestaurant = async (resId: string) => {
  if(confirm("هل أنت متأكد من حذف هذا المطعم؟")) {
    await set(ref(db, `restaurants/${resId}`), null);
    alert("تم حذف المطعم");
  }
};

const handleAdminLogin = () => {
    if (loginData.username === "admin" && loginData.password === "admin1234") {
      setIsAdminLoggedIn(true);
      setShowLoginDialog(false);
      setActiveView("admin");
      setUserRole("admin");
    } else {
      alert("بيانات الدخول غير صحيحة!");
    }
  };
  const handleAddRestaurant = async () => {
  if (!newRestData.name || !newRestData.cuisine) {
    alert("يرجى ملء اسم المطعم ونوعه");
    return;
  }

  const restaurantToSave = {
    ...newRestData,
    logo: "🏪", // أيقونة افتراضية
    rating: 5.0,
    reviews: 0,
    deliveryTime: "30-40",
    deliveryFee: 10,
    minOrder: 50,
    isOpen: true,
    address: "عنوان جديد",
    phone: "0123456789"
  };

  try {
    const restRef = ref(db, 'restaurants');
    await push(restRef, restaurantToSave);
    alert("تم حفظ المطعم بنجاح في Firebase!");
    setNewRestData({ name: "", cuisine: "", cover: "" }); // تصفير الخانات
    setShowAddRestaurant(false); // قفل النافذة
  } catch (error) {
    alert("حدث خطأ أثناء الحفظ");
  }
};

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const addToCart = (item: MenuItem, restaurantId: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.restaurantId === restaurantId)
      if (existing) {
        return prev.map((i) => (i.id === item.id && i.restaurantId === restaurantId ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1, restaurantId }]
    })
  }

  const removeFromCart = (itemId: number, restaurantId: number) => {
    setCart((prev) => prev.filter((i) => !(i.id === itemId && i.restaurantId === restaurantId)))
  }

  const updateQuantity = (itemId: number, restaurantId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === itemId && i.restaurantId === restaurantId) {
            const newQuantity = i.quantity + delta
            return newQuantity > 0 ? { ...i, quantity: newQuantity } : i
          }
          return i
        })
        .filter((i) => i.quantity > 0)
    )
  }

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.discount ? item.price * (1 - item.discount / 100) : item.price
    return sum + price * item.quantity
  }, 0)

  const filteredRestaurants = restaurants.filter(
    (r) => r.name.includes(searchQuery) || r.cuisine.includes(searchQuery)
  )

  const filteredMenuItems = menuItems.filter((item) => selectedCategory === "الكل" || item.category === selectedCategory)

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-500",
      preparing: "bg-blue-500",
      ready: "bg-green-500",
      delivering: "bg-purple-500",
      delivered: "bg-gray-500",
    }
    return colors[status]
  }

  const getStatusText = (status: Order["status"]) => {
    const texts = {
      pending: "في الانتظار",
      preparing: "قيد التحضير",
      ready: "جاهز",
      delivering: "في الطريق",
      delivered: "تم التوصيل",
    }
    return texts[status]
  }

  // Header Component
  const Header = () => (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setActiveView("home")
              setSelectedRestaurant(null)
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">فودي</span>
          </div>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن مطعم أو طبق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-secondary/50 border-0"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Location Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{selectedGovernorate}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-64 overflow-auto">
                {governorates.map((الجيزة) => (
                  <DropdownMenuItem key={الجيزة} onClick={() => setSelectedGovernorate(الجيزة)}>
                    {الجيزة}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Role Switcher - For Demo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex gap-1">
                  {userRole === "customer" && <User className="w-4 h-4" />}
                  {userRole === "restaurant" && <Store className="w-4 h-4" />}
                  {userRole === "admin" && <BarChart3 className="w-4 h-4" />}
                  <span className="text-sm">
                    {userRole === "customer" ? "عميل" : userRole === "restaurant" ? "مطعم" : "أدمن"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setUserRole("customer")}>
                  <User className="w-4 h-4 ml-2" />
                  عميل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUserRole("restaurant")}>
                  <Store className="w-4 h-4 ml-2" />
                  مطعم
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                  if (!isAdminLoggedIn) {
                     setShowLoginDialog(true); // يفتح شاشة الدخول لو مش مسجل
                  } else {
                     setActiveView("admin");
                     setUserRole("admin");
                   }
                  }}
                  >
                  <BarChart3 className="w-4 h-4 ml-2" />
                   أدمن
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark Mode Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن مطعم أو طبق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-secondary/50 border-0"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedGovernorate}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full max-h-64 overflow-auto">
                {governorates.map((الجيزة) => (
                  <DropdownMenuItem key={الجيزة} onClick={() => setSelectedGovernorate(الجيزة)}>
                    {الجيزة}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )

  // Hero Section
  const HeroSection = () => (
    <section className="relative overflow-hidden bg-gradient-to-bl from-primary/10 via-background to-accent/10 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Badge className="bg-primary/10 text-primary border-0 text-sm px-4 py-1">
              <Sparkles className="w-4 h-4 ml-1" />
              منصة المطاعم الذكية
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              اطلب أشهى المأكولات من{" "}
              <span className="text-primary">أفضل المطاعم</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              اكتشف تشكيلة واسعة من المطاعم المميزة واطلب وجباتك المفضلة بسهولة تامة. توصيل سريع وتجربة
              فريدة.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2">
                <Store className="w-5 h-5" />
                استكشف المطاعم
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Gift className="w-5 h-5" />
                العروض الحصرية
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">مطعم</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">طلب يومي</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">4.9</p>
                <p className="text-sm text-muted-foreground">تقييم</p>
              </div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {menuItems.slice(0, 4).map((item, idx) => (
                <div
                  key={item.id}
                  className={`bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border shadow-lg transform transition-all duration-300 hover:scale-105 ${
                    idx % 2 === 0 ? "translate-y-4" : ""
                  }`}
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-card-foreground">{item.name}</h3>
                  <p className="text-sm text-primary font-bold">{item.price} ج.م</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  // Restaurant Card
  const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => (
    <div
      className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => {
        setSelectedRestaurant(restaurant)
        setActiveView("restaurant")
      }}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={restaurant.cover}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {restaurant.isFeatured && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
            <Award className="w-3 h-3 ml-1" />
            مميز
          </Badge>
        )}
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="text-lg">مغلق الآن</Badge>
          </div>
        )}
        <div className="absolute bottom-3 right-3 text-4xl">{restaurant.logo}</div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg text-card-foreground">{restaurant.name}</h3>
            <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
          </div>
          <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{restaurant.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {restaurant.deliveryTime} د
          </span>
          <span className="flex items-center gap-1">
            <Truck className="w-4 h-4" />
            {restaurant.deliveryFee} ج.م
          </span>
          <span className="flex items-center gap-1">
            <CreditCard className="w-4 h-4" />
            {restaurant.minOrder}+ ج.م
          </span>
        </div>
      </div>
    </div>
  )

  // Menu Item Card
  const MenuItemCard = ({ item, restaurantId }: { item: MenuItem; restaurantId: number }) => (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        {item.isPopular && (
          <Badge className="absolute top-3 right-3 bg-orange-500 text-white">
            <TrendingUp className="w-3 h-3 ml-1" />
            الأكثر طلباً
          </Badge>
        )}
        {item.isNew && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white">
            <Sparkles className="w-3 h-3 ml-1" />
            جديد
          </Badge>
        )}
        {item.discount && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white">-{item.discount}%</Badge>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-card-foreground">{item.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{item.rating}</span>
          <span className="text-sm text-muted-foreground">({item.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {item.discount ? (
              <>
                <span className="text-lg font-bold text-primary">
                  {(item.price * (1 - item.discount / 100)).toFixed(0)} ج.م
                </span>
                <span className="text-sm text-muted-foreground line-through">{item.price} ج.م</span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">{item.price} ج.م</span>
            )}
          </div>
          <Button size="sm" onClick={() => addToCart(item, restaurantId)} className="gap-1">
            <Plus className="w-4 h-4" />
            أضف
          </Button>
        </div>
      </div>
    </div>
  )

  // Restaurant Page
  const RestaurantPage = () => {
    if (!selectedRestaurant) return null

    return (
      <div className="min-h-screen">
        {/* Cover Image */}
        <div className="relative h-64 md:h-80">
          <img
            src={selectedRestaurant.cover}
            alt={selectedRestaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => {
              setSelectedRestaurant(null)
              setActiveView("home")
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Restaurant Info */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="text-6xl">{selectedRestaurant.logo}</div>
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-card-foreground">{selectedRestaurant.name}</h1>
                    <p className="text-muted-foreground">{selectedRestaurant.cuisine}</p>
                  </div>
                  {/* ابحث عن هذا الجزء داخل RestaurantPage واستبدله */}
<div className="flex items-center gap-2">
  {/* زر القلب (المفضلة) التفاعلي */}
  <Button 
    variant="outline" 
    size="icon" 
    className="hover:text-red-500 transition-colors"
    onClick={() => alert("تمت إضافة " + selectedRestaurant.name + " للمفضلة! ❤️")}
  >
    <Heart className="w-5 h-5" />
  </Button>

  {/* زر المشاركة التفاعلي */}
  <Button 
    variant="outline" 
    size="icon" 
    className="hover:text-primary transition-colors"
    onClick={() => {
      // نسخ رابط الموقع الحالي للحافظة
      navigator.clipboard.writeText(window.location.href);
      alert("تم نسخ رابط مطعم " + selectedRestaurant.name + " بنجاح! 🔗");
    }}
  >
    <Share2 className="w-5 h-5" />
  </Button>
</div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{selectedRestaurant.rating}</span>
                    <span className="text-muted-foreground">({selectedRestaurant.reviews} تقييم)</span>
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {selectedRestaurant.deliveryTime} دقيقة
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Truck className="w-4 h-4" />
                    توصيل: {selectedRestaurant.deliveryFee} ج.م
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {selectedRestaurant.address}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-4">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="rounded-full"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Menu Items */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 pb-24">
            {filteredMenuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} restaurantId={selectedRestaurant.id} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  const AdminDashboard = () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground">مرحباً بك في لوحة إدارة فودي</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button
  variant="ghost"
  className="gap-2 text-destructive"
  onClick={() => {
    setIsAdminLoggedIn(false);
    setActiveView("home");
    setUserRole("customer");
  }}
>
  <LogOut className="w-4 h-4" />
  خروج من الإدارة
</Button>
          </div>
        </div>

       {/* Stats Grid */}
<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {/* إجمالي الطلبات - عند الضغط يفتح تبويب الطلبات */}
  <div 
    className="bg-card rounded-2xl border border-border p-6 cursor-pointer hover:border-primary transition-all"
    onClick={() => {
      // كود لجعل التبويب النشط هو الطلبات
      const tabsList = document.querySelectorAll('[role="tab"]');
      (tabsList[1] as HTMLElement)?.click(); 
    }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Package className="w-6 h-6 text-primary" />
      </div>
      <Badge className="bg-green-500/10 text-green-600 border-0">حقيقي</Badge>
    </div>
    <p className="text-2xl font-bold text-card-foreground">{realOrders.length}</p>
    <p className="text-sm text-muted-foreground">إجمالي الطلبات المستلمة</p>
  </div>

  {/* إجمالي الإيرادات - يحسب مجموع الطلبات الحقيقية */}
  <div className="bg-card rounded-2xl border border-border p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
        <TrendingUp className="w-6 h-6 text-accent" />
      </div>
    </div>
    <p className="text-2xl font-bold text-card-foreground">
      {realOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0).toLocaleString()} ج.م
    </p>
    <p className="text-sm text-muted-foreground">إجمالي مبيعات الموقع</p>
  </div>

  {/* المطاعم المسجلة */}
  <div className="bg-card rounded-2xl border border-border p-6 cursor-pointer hover:border-orange-500 transition-all"
       onClick={() => (document.querySelectorAll('[role="tab"]')[0] as HTMLElement)?.click()}>
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
        <Store className="w-6 h-6 text-orange-500" />
      </div>
    </div>
    <p className="text-2xl font-bold text-card-foreground">{restaurants.length}</p>
    <p className="text-sm text-muted-foreground">المطاعم النشطة</p>
  </div>

  {/* نقاط الولاء الموزعة (مثال) */}
  <div className="bg-card rounded-2xl border border-border p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
        <Users className="w-6 h-6 text-blue-500" />
      </div>
    </div>
    <p className="text-2xl font-bold text-card-foreground">{realOrders.length * 10}</p>
    <p className="text-sm text-muted-foreground">إجمالي نقاط العملاء</p>
  </div>
</div>

        {/* Content Tabs */}
        <Tabs defaultValue="restaurants" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="restaurants">المطاعم</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="top-items">الأصناف الأكثر مبيعاً</TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">إدارة المطاعم</h2>
              <Button className="gap-2" onClick={() => setShowAddRestaurant(true)}>
                 <Plus className="w-4 h-4" />
                  إضافة مطعم جديد
              </Button>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">المطعم</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">النوع</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">التقييم</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">الحالة</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="border-t border-border">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{restaurant.logo}</span>
                            <span className="font-medium">{restaurant.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{restaurant.cuisine}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {restaurant.rating}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={restaurant.isOpen ? "default" : "secondary"}>
                            {restaurant.isOpen ? "مفتوح" : "مغلق"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-xl font-bold">آخر الطلبات</h2>
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                        {restaurants[i % restaurants.length].logo}
                      </div>
                      <div>
                        <p className="font-medium">طلب #{1000 + i}</p>
                        <p className="text-sm text-muted-foreground">
                          {restaurants[i % restaurants.length].name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`${getStatusColor(["pending", "preparing", "ready", "delivering", "delivered"][i % 5] as Order["status"])} text-white`}>
                        {getStatusText(["pending", "preparing", "ready", "delivering", "delivered"][i % 5] as Order["status"])}
                      </Badge>
                      <span className="font-bold">{(Math.random() * 200 + 50).toFixed(0)} ج.م</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top-items" className="space-y-4">
            <h2 className="text-xl font-bold">الأصناف الأكثر مبيعاً</h2>
            <div className="grid gap-4">
              {dashboardStats.topItems.map((item, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-primary">{item.revenue.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{item.orders} طلب</span>
                    <Progress value={(item.orders / 400) * 100} className="w-32 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  // Cart Drawer
  const CartDrawer = () => (
    <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            سلة التسوق
          </DialogTitle>
          <DialogDescription>
            {cart.length === 0
              ? "سلة التسوق فارغة"
              : `${cart.reduce((sum, item) => sum + item.quantity, 0)} عناصر`}
          </DialogDescription>
        </DialogHeader>

        {cart.length > 0 ? (
          <>
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.restaurantId}`} className="flex gap-3 p-2 rounded-lg bg-secondary/30">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-sm text-primary font-bold">
                        {item.discount
                          ? (item.price * (1 - item.discount / 100)).toFixed(0)
                          : item.price}{" "}
                        ج.م
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => updateQuantity(item.id, item.restaurantId, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => updateQuantity(item.id, item.restaurantId, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive"
                          onClick={() => removeFromCart(item.id, item.restaurantId)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span>{cartTotal.toFixed(0)} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">رسوم التوصيل</span>
                <span>10 ج.م</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{(cartTotal + 10).toFixed(0)} ج.م</span>
              </div>
            </div>

            <Button className="w-full gap-2" size="lg" onClick={handleCheckout}>
  <CreditCard className="w-5 h-5" />
  إتمام الطلب وحفظه أونلاين
</Button>
          </>
        ) : (
          <div className="py-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">ابدأ بإضافة أصناف لسلتك</p>
            <Button className="mt-4" onClick={() => setIsCartOpen(false)}>
              تصفح المطاعم
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  // Home Page
  const HomePage = () => (
    <main>
      <HeroSection />

      {/* Featured Restaurants */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">المطاعم المميزة</h2>
              <p className="text-muted-foreground">اكتشف أفضل المطاعم في منطقتك</p>
            </div>
            <Button size="lg" className="gap-2" onClick={() => document.getElementById('restaurants-section')?.scrollIntoView({behavior: 'smooth'})}>
  <Store className="w-5 h-5" />
  استكشف المطاعم
</Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </section>

      {/* Daily Offers */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">عروض اليوم</h2>
              <p className="text-muted-foreground">استفد من أفضل العروض والخصومات</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {menuItems
              .filter((item) => item.discount || item.isPopular)
              .slice(0, 4)
              .map((item) => (
                <MenuItemCard key={item.id} item={item} restaurantId={1} />
              ))}
          </div>
        </div>
      </section>

      {/* Loyalty Program */}
      {userRole === "customer" && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-bl from-primary/20 via-card to-accent/20 rounded-3xl p-8 border border-border">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <Badge className="bg-primary/10 text-primary border-0">
                    <Award className="w-4 h-4 ml-1" />
                    برنامج الولاء
                  </Badge>
                  <h2 className="text-3xl font-bold text-foreground">اجمع النقاط واحصل على مكافآت</h2>
                  <p className="text-muted-foreground">
                    مع كل طلب تحصل على نقاط يمكنك استبدالها بخصومات وهدايا مميزة
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="bg-card rounded-2xl p-4 border border-border">
                      <p className="text-3xl font-bold text-primary">{loyaltyPoints}</p>
                      <p className="text-sm text-muted-foreground">نقاطك الحالية</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 border border-border">
                      <p className="text-3xl font-bold text-accent">500</p>
                      <p className="text-sm text-muted-foreground">للمستوى التالي</p>
                    </div>
                  </div>
                  <Progress value={(loyaltyPoints / 500) * 100} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border text-center">
                    <Gift className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="font-medium">خصم 10%</p>
                    <p className="text-sm text-muted-foreground">100 نقطة</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border text-center">
                    <Truck className="w-8 h-8 mx-auto text-accent mb-2" />
                    <p className="font-medium">توصيل مجاني</p>
                    <p className="text-sm text-muted-foreground">200 نقطة</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border text-center">
                    <ChefHat className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                    <p className="font-medium">وجبة مجانية</p>
                    <p className="text-sm text-muted-foreground">500 نقطة</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border text-center">
                    <Sparkles className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                    <p className="font-medium">عضوية VIP</p>
                    <p className="text-sm text-muted-foreground">1000 نقطة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Order Tracking */}
      {/* استبدل الجزء الخاص بالـ Order Tracking بهذا */}
{userRole === "customer" && realOrders.length > 0 && (
  <section className="py-12 bg-secondary/30">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">تتبع طلباتك الحالية</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {realOrders.slice(0, 2).map((order) => ( // عرض آخر طلبين
          <div key={order.id} className="bg-card rounded-2xl border border-border p-6">
             {/* ... نفس كود التصميم اللي عندك بس هيستخدم بيانات order الحقيقية ... */}
             <p className="font-bold">حالة الطلب: {getStatusText(order.status)}</p>
             <Progress value={order.status === "delivered" ? 100 : 50} className="mt-2" />
          </div>
        ))}
      </div>
    </div>
  </section>
)}

      {/* Features */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">لماذا فودي؟</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              نقدم لك تجربة طلب طعام استثنائية مع ميزات فريدة تجعل حياتك أسهل
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">توصيل سريع</h3>
              <p className="text-sm text-muted-foreground">
                نضمن وصول طلبك في أسرع وقت ممكن
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-foreground mb-2">مطاعم متنوعة</h3>
              <p className="text-sm text-muted-foreground">
                اختر من بين مئات المطاعم المميزة
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-foreground mb-2">جودة مضمونة</h3>
              <p className="text-sm text-muted-foreground">
                نختار لك أفضل المطاعم فقط
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-bold text-foreground mb-2">دعم متواصل</h3>
              <p className="text-sm text-muted-foreground">
                فريق دعم متاح على مدار الساعة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">فودي</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                منصة متكاملة لإدارة المطاعم والطلبات بتصميم احترافي
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Globe className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">الرئيسية</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">المطاعم</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">العروض</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">تسجيل مطعمك</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">الدعم</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">الشروط والأحكام</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">اتصل بنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +20 100 123 4567
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@foodie.com
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  القاهرة، مصر
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 فودي. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-4">
              <span>العربية</span>
              <span>|</span>
              <span>English</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {activeView === "home" && <HomePage />}
      {activeView === "restaurant" && <RestaurantPage />}
      {activeView === "admin" && <AdminDashboard />}
      <CartDrawer />
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <Dialog open={showAddRestaurant} onOpenChange={setShowAddRestaurant}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>إضافة مطعم جديد للمنصة</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">اسم المطعم</label>
        <Input 
          placeholder="مثلاً: مطعم السعادة" 
          value={newRestData.name}
          onChange={(e) => setNewRestData({...newRestData, name: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">نوع المطبخ</label>
        <Input 
          placeholder="مثلاً: مشويات" 
          value={newRestData.cuisine}
          onChange={(e) => setNewRestData({...newRestData, cuisine: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">رابط صورة الغلاف</label>
        <Input 
          placeholder="ضع رابط صورة من الإنترنت" 
          value={newRestData.cover}
          onChange={(e) => setNewRestData({...newRestData, cover: e.target.value})}
        />
      </div>
      <Button className="w-full mt-4" onClick={handleAddRestaurant}>
        حفظ المطعم الآن
      </Button>
    </div>
  </DialogContent>
</Dialog>
  <DialogContent className="sm:max-w-[400px]">
    <DialogHeader>
      <DialogTitle className="text-center">دخول الإدارة</DialogTitle>
      <DialogDescription className="text-center">
        أدخل البيانات للتحكم في المطعم والطلبات
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">اسم المستخدم</label>
        <Input 
          placeholder="admin" 
          value={loginData.username}
          onChange={(e) => setLoginData({...loginData, username: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">كلمة المرور</label>
        <Input 
          type="password" 
          placeholder="••••••••" 
          value={loginData.password}
          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
        />
      </div>
      <Button className="w-full mt-4" onClick={handleAdminLogin}>
        تسجيل الدخول
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </div>
  )
}
