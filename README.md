# ⚡ Power Cost Card

**Power Cost Card** is a custom Home Assistant card that calculates  
power consumption and electricity cost for devices based on their  
power usage and active time.

The card supports:

- ⚡ Real-time power consumption
- 💰 Electricity cost calculation
- 📊 Graph visualization
- 🔌 Multiple entities
- 🏆 Top energy consumers ranking
- 🎨 Advanced UI customization
- 📱 Mobile friendly interface

---

## 📸 Screenshots

![1](https://github.com/user-attachments/assets/5c85e9fd-bb90-4e71-9345-34d616de072b)

![2](https://github.com/user-attachments/assets/d991fec8-1799-4e36-9a7e-ffe8d1ee38a5)

![5](https://github.com/user-attachments/assets/721ab3b5-7b14-4ebe-b5af-8190b4dec534)

![4](https://github.com/user-attachments/assets/d23e5588-4112-4838-b0f9-bae5477259cc)

![3](https://github.com/user-attachments/assets/b25a5964-6da9-4507-b4f5-845b02150244)

---

# ⚙️ Example Configuration

```yaml
type: custom:power-cost-card
title: עלות צריכת חשמל
currency: ₪
default_price_per_kwh: 0.64
refresh_seconds: 60
show_period_selector: true
show_toggle: true
show_total: true
show_details: true
entities:
  - entity: light.ch_3
    name: סיר חמין
    power_w: 440
    price_per_kwh: 0.64
    icon: mdi:bed-empty
    active_icon_color: "#00bfa5"
    currency: ₪
  - entity: light.ch_1
    name: מנורה מטבח
    power_w: 300
    price_per_kwh: 64.32
    currency: ₪
    icon: mdi:account-group
    active_icon_color: "#FFC107"
    allow_minimize: true
  - entity: light.ch_10
    name: תנור מקלחת
    power_w: 2500
    price_per_kwh: 0.64
    currency: ₪
    icon: mdi:radiator
    active_icon_color: "#ef6c00"
    allow_minimize: true
  - entity: light.ch_105
    name: מספדת תלת מימד
    power_w: 900
    price_per_kwh: 0.64
    icon: mdi:desktop-classic
    active_icon_color: "#ffd54f"
    allow_minimize: true
    currency: ₪
  - entity: light.ch_2
    name: מנורת לילה
    power_w: 100
    icon: mdi:lightbulb-on
    active_icon_color: "#7c4dff"
    currency: ₪
    price_per_kwh: 0.64
  - entity: light.ch_151
    name: רומי
    power_w: 10000
    price_per_kwh: 0.63
    icon: mdi:lock-open-variant-outline
    active_icon_color: "#F44336"
    allow_minimize: true
    currency: ₪
show_formula: false
show_graph: true
show_minimize: false
enable_icon_animation: true
accordion_mode: true
radio_mode: true
background_image: /local/homekit-bg-4.jpeg
background_opacity: 1
background_blur: 8
fixed_charge_allocation: proportional
pricing_mode: israel_tariff_plus_fixed
fixed_charge_amount: 11.01
